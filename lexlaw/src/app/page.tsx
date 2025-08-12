import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome to LexLaw</h1>
      <p className="text-gray-700">Manage clients, cases, time tracking, and invoicing.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/clients" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium">Clients</div>
          <div className="text-sm text-gray-600">Create and track client information.</div>
        </Link>
        <Link href="/cases" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium">Cases</div>
          <div className="text-sm text-gray-600">Open cases and monitor status.</div>
        </Link>
        <Link href="/time" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium">Time</div>
          <div className="text-sm text-gray-600">Log billable hours.</div>
        </Link>
        <Link href="/invoices" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium">Invoices</div>
          <div className="text-sm text-gray-600">Create invoices and add items.</div>
        </Link>
      </div>
    </div>
  );
}
