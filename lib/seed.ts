import type { DatabaseSync } from 'node:sqlite';

const CLIENTS: [number, string, string][] = [
  [1, 'Harborview Studio', 'US'],
  [2, 'Meridian Labs', 'DE'],
  [3, 'Fjord & Fen Oy', 'FI'],
  [4, 'Kurume Digital', 'JP'],
  [5, 'Atlas Freight Co', 'AU'],
];

// (daysAgo, client, status, daysToPay|null)
const PLAN: [number, number, 'paid' | 'pending' | 'overdue', number | null][] = [
  [2, 4, 'pending', null], [5, 1, 'paid', 3], [6, 2, 'overdue', null],
  [9, 5, 'paid', 6], [11, 1, 'paid', 2], [13, 3, 'pending', null],
  [16, 2, 'paid', 5], [19, 4, 'paid', 1], [21, 5, 'overdue', null],
  [24, 1, 'paid', 4], [27, 3, 'paid', 7], [30, 2, 'paid', 3],
  [34, 4, 'pending', null], [38, 5, 'paid', 8], [41, 1, 'paid', 2],
  [45, 2, 'paid', 4], [49, 3, 'paid', 6], [52, 4, 'paid', 3],
  [56, 5, 'paid', 5], [60, 1, 'paid', 2], [64, 2, 'paid', 6],
  [68, 3, 'paid', 4], [72, 4, 'paid', 3], [76, 5, 'paid', 7],
  [80, 1, 'paid', 5], [84, 2, 'paid', 2], [88, 3, 'paid', 6],
  [93, 4, 'paid', 4], [97, 5, 'paid', 3], [101, 1, 'paid', 5],
];

const SERVICES: [string, number, number][] = [
  ['Next.js bug triage & hotfix', 1, 45000],
  ['Performance audit (Core Web Vitals)', 1, 38000],
  ['Feature build: billing & webhooks', 2, 62000],
  ['Migration: REST → App Router', 3, 55000],
  ['LLM chat integration (RAG)', 2, 74000],
  ['Regression test suite setup', 1, 32000],
  ['Dashboard MVP sprint (1 week)', 3, 85000],
  ['Code review & mentorship (weekly)', 1, 28000],
];

function isoDaysAgo(days: number, hour = 12, minute = 30): string {
  const d = new Date(Date.now() - days * 86_400_000);
  d.setUTCHours(hour, minute, 17, 0);
  return d.toISOString();
}

export function seed(db: DatabaseSync) {
  const insClient = db.prepare('INSERT INTO clients (id, name, country) VALUES (?, ?, ?)');
  for (const c of CLIENTS) insClient.run(...c);

  const insInv = db.prepare(
    `INSERT INTO invoices (client_id, number, issued_at, due_at, status, paid_at, total_cents)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const insItem = db.prepare(
    'INSERT INTO line_items (invoice_id, description, qty, unit_price_cents) VALUES (?, ?, ?, ?)',
  );

  PLAN.forEach(([daysAgo, clientId, status, payDays], i) => {
    const issued = isoDaysAgo(daysAgo);
    const due = isoDaysAgo(daysAgo - 14);
    const paid = status === 'paid' && payDays != null ? isoDaysAgo(daysAgo - payDays) : null;
    const [d1, q1, p1] = SERVICES[i % SERVICES.length];
    const items: [string, number, number][] = [[d1, q1, p1]];
    if (i % 3 === 0) items.push(SERVICES[(i + 3) % SERVICES.length]);
    const total = items.reduce((a, [, q, p]) => a + q * p, 0);
    const info = insInv.run(
      clientId, `INV-2026-${String(i + 101).padStart(4, '0')}`,
      issued, due, status, paid, total,
    );
    for (const [desc, qty, price] of items) {
      insItem.run(info.lastInsertRowid as number, desc, qty, price);
    }
  });
}
