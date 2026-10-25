import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'path';
import { seed } from './seed';

const DB_PATH = process.env.LEDGER_DB ?? path.join(process.cwd(), 'data', 'ledger.db');

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL, country TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      number TEXT NOT NULL,
      issued_at TEXT NOT NULL,          -- ISO instant
      due_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('paid','pending','overdue')),
      paid_at TEXT,
      total_cents INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS line_items (
      id INTEGER PRIMARY KEY,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id),
      description TEXT NOT NULL,
      qty INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL
    );
  `);
  const row = db.prepare('SELECT COUNT(*) AS n FROM invoices').get() as { n: number };
  if (row.n === 0) seed(db);
  return db;
}

export type InvoiceRow = {
  id: number;
  number: string;
  client_name: string;
  country: string;
  issued_at: string;
  due_at: string;
  status: 'paid' | 'pending' | 'overdue';
  paid_at: string | null;
  total_cents: number;
};
