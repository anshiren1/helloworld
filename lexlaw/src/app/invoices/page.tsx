import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createInvoice(formData: FormData) {
  "use server";
  const clientId = Number(formData.get("clientId"));
  const dueDateStr = String(formData.get("dueDate") || "");
  const notes = String(formData.get("notes") || "").trim() || null;
  const dueDate = dueDateStr ? new Date(dueDateStr) : null;
  if (!clientId) return;
  await prisma.invoice.create({ data: { clientId, dueDate, notes } });
  revalidatePath("/invoices");
}

async function addItem(formData: FormData) {
  "use server";
  const invoiceId = Number(formData.get("invoiceId"));
  const description = String(formData.get("description") || "").trim();
  const quantity = parseFloat(String(formData.get("quantity") || "1"));
  const unitPrice = parseFloat(String(formData.get("unitPrice") || "0"));
  const amount = quantity * unitPrice;
  if (!invoiceId || !description) return;
  await prisma.invoiceItem.create({ data: { invoiceId, description, quantity, unitPrice, amount } });
  revalidatePath("/invoices");
}

export default async function InvoicesPage() {
  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      include: { client: true, items: true, payments: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-gray-600">Create invoices and manage items.</p>
      </div>

      <form action={createInvoice} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded">
        <select name="clientId" className="border rounded px-3 py-2" required>
          <option value="">Select client…</option>
          {clients.map((cl) => (
            <option key={cl.id} value={cl.id}>
              {cl.lastName}, {cl.firstName}
            </option>
          ))}
        </select>
        <input name="dueDate" type="date" className="border rounded px-3 py-2" />
        <input name="notes" placeholder="Notes" className="border rounded px-3 py-2" />
        <div className="md:col-span-3">
          <button className="bg-black text-white px-4 py-2 rounded">Create Invoice</button>
        </div>
      </form>

      <div className="space-y-6">
        {invoices.map((inv) => {
          const subtotal = inv.items.reduce((s, it) => s + it.amount, 0);
          const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
          const balance = subtotal - paid;
          return (
            <div key={inv.id} className="border rounded">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3 bg-gray-50">
                <div className="space-y-0.5">
                  <div className="font-medium">Invoice #{inv.id} — {inv.client.lastName}, {inv.client.firstName}</div>
                  <div className="text-xs text-gray-600">Issued {new Date(inv.issueDate).toLocaleDateString()} {inv.dueDate ? `· Due ${new Date(inv.dueDate).toLocaleDateString()}` : ""}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">Subtotal ${subtotal.toFixed(2)}</div>
                  <div className="text-sm">Paid ${paid.toFixed(2)}</div>
                  <div className="font-semibold">Balance ${balance.toFixed(2)}</div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Description</th>
                        <th className="py-2 pr-4">Qty</th>
                        <th className="py-2 pr-4">Unit Price</th>
                        <th className="py-2 pr-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items.map((it) => (
                        <tr key={it.id} className="border-b">
                          <td className="py-2 pr-4">{it.description}</td>
                          <td className="py-2 pr-4">{it.quantity}</td>
                          <td className="py-2 pr-4">${it.unitPrice.toFixed(2)}</td>
                          <td className="py-2 pr-4">${it.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                      {inv.items.length === 0 && (
                        <tr>
                          <td className="py-2 pr-4" colSpan={4}>No items yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <form action={addItem} className="grid grid-cols-1 md:grid-cols-4 gap-3 border p-3 rounded">
                  <input type="hidden" name="invoiceId" value={inv.id} />
                  <input name="description" placeholder="Description" className="border rounded px-3 py-2 md:col-span-2" required />
                  <input name="quantity" type="number" step="0.1" min="0" placeholder="Qty" className="border rounded px-3 py-2" defaultValue="1" required />
                  <input name="unitPrice" type="number" step="0.01" min="0" placeholder="Unit Price" className="border rounded px-3 py-2" defaultValue="0" required />
                  <div className="md:col-span-4">
                    <button className="bg-black text-white px-4 py-2 rounded">Add Item</button>
                  </div>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}