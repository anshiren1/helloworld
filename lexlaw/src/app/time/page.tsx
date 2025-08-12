import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createTimeEntry(formData: FormData) {
  "use server";
  const caseId = Number(formData.get("caseId"));
  const workDate = new Date(String(formData.get("workDate") || new Date().toISOString().slice(0, 10)));
  const hours = parseFloat(String(formData.get("hours") || "0"));
  const rate = parseFloat(String(formData.get("rate") || "0"));
  const description = String(formData.get("description") || "").trim() || null;
  const billable = String(formData.get("billable")) === "on";
  if (!caseId || !hours || !rate) return;
  await prisma.timeEntry.create({ data: { caseId, workDate, hours, rate, description, billable } });
  revalidatePath("/time");
}

export default async function TimePage() {
  const [entries, cases] = await Promise.all([
    prisma.timeEntry.findMany({ include: { case: { include: { client: true } } }, orderBy: { workDate: "desc" } }),
    prisma.case.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Time Tracking</h1>
        <p className="text-sm text-gray-600">Log and view time entries.</p>
      </div>

      <form action={createTimeEntry} className="grid grid-cols-1 md:grid-cols-6 gap-4 border p-4 rounded">
        <select name="caseId" className="border rounded px-3 py-2 md:col-span-2" required>
          <option value="">Select case…</option>
          {cases.map((k) => (
            <option key={k.id} value={k.id}>
              {k.title} — {k.client.lastName}, {k.client.firstName}
            </option>
          ))}
        </select>
        <input name="workDate" type="date" className="border rounded px-3 py-2" defaultValue={new Date().toISOString().slice(0, 10)} required />
        <input name="hours" placeholder="Hours" type="number" step="0.1" min="0" className="border rounded px-3 py-2" required />
        <input name="rate" placeholder="Rate" type="number" step="0.01" min="0" className="border rounded px-3 py-2" required />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="billable" defaultChecked /> Billable</label>
        <input name="description" placeholder="Description" className="border rounded px-3 py-2 md:col-span-6" />
        <div className="md:col-span-6">
          <button className="bg-black text-white px-4 py-2 rounded">Add Entry</button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Case</th>
              <th className="py-2 pr-4">Client</th>
              <th className="py-2 pr-4">Hours</th>
              <th className="py-2 pr-4">Rate</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Billable</th>
              <th className="py-2 pr-4">Description</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">{new Date(e.workDate).toLocaleDateString()}</td>
                <td className="py-2 pr-4">{e.case.title}</td>
                <td className="py-2 pr-4">{e.case.client.lastName}, {e.case.client.firstName}</td>
                <td className="py-2 pr-4">{e.hours.toFixed(1)}</td>
                <td className="py-2 pr-4">${e.rate.toFixed(2)}</td>
                <td className="py-2 pr-4">${(e.hours * e.rate).toFixed(2)}</td>
                <td className="py-2 pr-4">{e.billable ? "Yes" : "No"}</td>
                <td className="py-2 pr-4">{e.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}