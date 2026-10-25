import { getDb, type InvoiceRow } from './db';

export function listInvoices(opts: { q?: string; status?: string } = {}): InvoiceRow[] {
  const db = getDb();
  const where: string[] = [];
  const params: (string)[] = [];
  if (opts.q) {
    where.push('(i.number LIKE ? OR c.name LIKE ?)');
    params.push(`%${opts.q}%`, `%${opts.q}%`);
  }
  if (opts.status && ['paid', 'pending', 'overdue'].includes(opts.status)) {
    where.push('i.status = ?');
    params.push(opts.status);
  }
  const sql = `
    SELECT i.id, i.number, c.name AS client_name, c.country,
           i.issued_at, i.due_at, i.status, i.paid_at, i.total_cents
    FROM invoices i JOIN clients c ON c.id = i.client_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY i.issued_at DESC`;
  return db.prepare(sql).all(...params) as unknown as InvoiceRow[];
}

export function invoiceById(id: number) {
  const db = getDb();
  const invoice = db.prepare(
    `SELECT i.id, i.number, c.name AS client_name, c.country,
            i.issued_at, i.due_at, i.status, i.paid_at, i.total_cents
     FROM invoices i JOIN clients c ON c.id = i.client_id WHERE i.id = ?`,
  ).get(id) as InvoiceRow | undefined;
  if (!invoice) return undefined;
  const items = db.prepare(
    'SELECT description, qty, unit_price_cents FROM line_items WHERE invoice_id = ? ORDER BY id',
  ).all(id) as { description: string; qty: number; unit_price_cents: number }[];
  return { invoice, items };
}

export type Stats = ReturnType<typeof stats>;

export function stats() {
  const db = getDb();
  const outstanding = db.prepare(
    `SELECT COALESCE(SUM(total_cents), 0) AS cents FROM invoices WHERE status IN ('pending','overdue')`,
  ).get() as { cents: number };
  const overdue = db.prepare(
    `SELECT COUNT(*) AS n FROM invoices WHERE status = 'overdue'`,
  ).get() as { n: number };
  const rows = db.prepare(
    `SELECT issued_at, total_cents FROM invoices ORDER BY issued_at`,
  ).all() as { issued_at: string; total_cents: number }[];

  const now = Date.now();
  const revenue30d = rows
    .filter((r) => now - new Date(r.issued_at).getTime() <= 30 * 86_400_000)
    .reduce((a, r) => a + r.total_cents, 0);

  // monthly series (JST buckets), last 4 months
  const byMonth = new Map<string, number>();
  for (const r of rows) {
    const key = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit',
    }).format(new Date(r.issued_at));
    byMonth.set(key, (byMonth.get(key) ?? 0) + r.total_cents);
  }
  const months = [...byMonth.entries()].sort().slice(-4);

  // average days to pay (paid invoices)
  const paid = db.prepare(
    'SELECT issued_at, paid_at FROM invoices WHERE status = ? AND paid_at IS NOT NULL',
  ).all('paid') as { issued_at: string; paid_at: string }[];
  const avgDaysToPay = paid.length
    ? Math.round(
        paid.reduce((a, p) => a + (new Date(p.paid_at!).getTime() - new Date(p.issued_at).getTime()) / 86_400_000, 0) / paid.length,
      )
    : 0;

  return {
    outstandingCents: outstanding.cents,
    overdueCount: overdue.n,
    revenue30dCents: revenue30d,
    avgDaysToPay,
    months, // [ [YYYY-MM, cents], ... ]
  };
}
