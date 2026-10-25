// Money & date helpers — the same discipline as the bug-fix casebook:
// integer cents end-to-end, day buckets in the business timezone (JST).

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export function dayKey(inst: string, timeZone = 'Asia/Tokyo'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(inst));
}

export function monthKey(inst: string, timeZone = 'Asia/Tokyo'): string {
  return dayKey(inst, timeZone).slice(0, 7); // YYYY-MM
}
