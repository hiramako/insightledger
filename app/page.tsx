import Link from "next/link";
import { stats } from "@/lib/queries";
import { formatCents } from "@/lib/money";
import { DigestPanel } from "@/components/DigestPanel";

export const dynamic = "force-dynamic";

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function RevenueChart({ months }: { months: [string, number][] }) {
  const max = Math.max(...months.map(([, c]) => c), 1);
  const h = 160;
  const barW = 56;
  const gap = 40;
  const w = months.length * (barW + gap) + gap;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Invoiced revenue (JST months)
      </div>
      <svg viewBox={`0 0 ${w} ${h + 28}`} className="mt-3 w-full" role="img" aria-label="Monthly invoiced revenue">
        {months.map(([m, cents], i) => {
          const bh = Math.max(4, Math.round((cents / max) * h));
          const x = gap + i * (barW + gap);
          return (
            <g key={m}>
              <rect x={x} y={h - bh} width={barW} height={bh} rx={4} className="fill-indigo-600" />
              <text x={x + barW / 2} y={h + 16} textAnchor="middle" className="fill-slate-500 text-[11px]">
                {m}
              </text>
              <text x={x + barW / 2} y={h - bh - 6} textAnchor="middle" className="fill-slate-600 text-[10px]">
                {formatCents(cents)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default async function Dashboard() {
  const s = stats();
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Cash dashboard</h1>
        <Link href="/invoices" className="text-sm text-indigo-600 hover:underline">
          All invoices →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Invoiced · 30d" value={formatCents(s.revenue30dCents)} hint="rolling window, JST days" />
        <Kpi label="Outstanding" value={formatCents(s.outstandingCents)} hint="pending + overdue" />
        <Kpi label="Overdue" value={String(s.overdueCount)} hint="past due date" />
        <Kpi label="Avg time to pay" value={`${s.avgDaysToPay}d`} hint="across paid invoices" />
      </div>
      <RevenueChart months={s.months} />
      <DigestPanel />
    </div>
  );
}
