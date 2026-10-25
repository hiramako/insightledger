import Link from "next/link";
import { notFound } from "next/navigation";
import { invoiceById } from "@/lib/queries";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" });

export default async function InvoiceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = invoiceById(Number(id));
  if (!data) notFound();
  const { invoice, items } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/invoices" className="text-sm text-indigo-600 hover:underline">← Invoices</Link>
        <div className="mt-2 flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{invoice.number}</h1>
          <span className="text-sm text-slate-500">{invoice.client_name} ({invoice.country})</span>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${
            invoice.status === "paid" ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : invoice.status === "pending" ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {invoice.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Issued {dateFmt.format(new Date(invoice.issued_at))} · Due {dateFmt.format(new Date(invoice.due_at))}
          {invoice.paid_at ? ` · Paid ${dateFmt.format(new Date(invoice.paid_at))}` : ""}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit price</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it, i) => (
              <tr key={i}>
                <td className="px-4 py-3">{it.description}</td>
                <td className="px-4 py-3 text-right tabular-nums">{it.qty}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatCents(it.unit_price_cents)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCents(it.qty * it.unit_price_cents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 font-semibold">
              <td colSpan={3} className="px-4 py-3 text-right">Total</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCents(invoice.total_cents)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        Totals are summed in integer cents, so line items always equal the grand total — no float drift.
      </p>
    </div>
  );
}
