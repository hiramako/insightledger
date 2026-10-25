import Link from "next/link";
import { listInvoices } from "@/lib/queries";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "paid", "pending", "overdue"] as const;

function Badge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    overdue: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default async function Invoices({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "all" } = await searchParams;
  const rows = listInvoices({ q, status: status === "all" ? undefined : status });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>
      <form className="flex flex-wrap items-center gap-3" action="/invoices">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search number or client…"
          className="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              name="status"
              value={s}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                s === status
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Issued (JST)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/invoices/${r.id}`} className="font-medium text-indigo-600 hover:underline">
                    {r.number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {r.client_name} <span className="text-xs text-slate-400">{r.country}</span>
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-600">
                  {new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date(r.issued_at))}
                </td>
                <td className="px-4 py-3"><Badge status={r.status} /></td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{formatCents(r.total_cents)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No matches.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">{rows.length} invoice(s)</p>
    </div>
  );
}
