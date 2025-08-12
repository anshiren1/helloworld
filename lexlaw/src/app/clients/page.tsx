import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function createClient(formData: FormData) {
  "use server";
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!firstName || !lastName) {
    redirect("/clients?error=Missing+name");
  }

  await prisma.client.create({
    data: { firstName, lastName, email, phone, address, notes },
  });
  revalidatePath("/clients");
}

async function deleteClient(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-gray-600">Create and manage clients.</p>
      </div>

      <form action={createClient} className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded">
        <input name="firstName" placeholder="First name" className="border rounded px-3 py-2" required />
        <input name="lastName" placeholder="Last name" className="border rounded px-3 py-2" required />
        <input name="email" placeholder="Email" type="email" className="border rounded px-3 py-2 md:col-span-2" />
        <input name="phone" placeholder="Phone" className="border rounded px-3 py-2" />
        <input name="address" placeholder="Address" className="border rounded px-3 py-2 md:col-span-2" />
        <input name="notes" placeholder="Notes" className="border rounded px-3 py-2 md:col-span-2" />
        <div className="md:col-span-2">
          <button className="bg-black text-white px-4 py-2 rounded">Add Client</button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Active</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">{c.lastName}, {c.firstName}</td>
                <td className="py-2 pr-4">{c.email || "—"}</td>
                <td className="py-2 pr-4">{c.phone || "—"}</td>
                <td className="py-2 pr-4">{c.active ? "Yes" : "No"}</td>
                <td className="py-2 pr-4">
                  <form action={deleteClient}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-red-600 hover:underline" type="submit">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}