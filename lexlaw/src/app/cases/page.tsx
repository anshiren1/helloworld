import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createCase(formData: FormData) {
  "use server";
  const clientId = Number(formData.get("clientId"));
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!clientId || !title) return;
  await prisma.case.create({ data: { clientId, title, description } });
  revalidatePath("/cases");
}

export default async function CasesPage() {
  const [cases, clients] = await Promise.all([
    prisma.case.findMany({ include: { client: true }, orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Cases</h1>
        <p className="text-sm text-gray-600">Open and track cases.</p>
      </div>

      <form action={createCase} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded">
        <select name="clientId" className="border rounded px-3 py-2" required>
          <option value="">Select client…</option>
          {clients.map((cl) => (
            <option key={cl.id} value={cl.id}>
              {cl.lastName}, {cl.firstName}
            </option>
          ))}
        </select>
        <input name="title" placeholder="Case title" className="border rounded px-3 py-2" required />
        <input name="description" placeholder="Description" className="border rounded px-3 py-2 md:col-span-2" />
        <div className="md:col-span-2">
          <button className="bg-black text-white px-4 py-2 rounded">Open Case</button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Case</th>
              <th className="py-2 pr-4">Client</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Opened</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((kase) => (
              <tr key={kase.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">{kase.title}</td>
                <td className="py-2 pr-4">{kase.client.lastName}, {kase.client.firstName}</td>
                <td className="py-2 pr-4">{kase.status}</td>
                <td className="py-2 pr-4">{new Date(kase.openedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}