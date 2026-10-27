# InsightLedger — invoice dashboard with an AI digest

**Live demo: https://portfolio.kremoa.com** (demo data, JST reporting)

A production-shaped Next.js MVP demo: SQLite-backed invoicing for a freelance
web studio, with JST-aware reporting and an AI cash-flow digest that runs with
or without an OpenAI key.

## What it demonstrates

| Concern | How |
|---|---|
| Data layer | `node:sqlite` (zero native deps), idempotent seed, prepared statements |
| Correct money math | integer cents end-to-end; `Intl.NumberFormat` only at the edges — line items always equal the grand total |
| Timezone honesty | revenue buckets in `Asia/Tokyo` via `Intl.DateTimeFormat` — night sales never leak into the wrong day |
| Server Components + streaming | dashboard/invoices/detail are RSC; search/filter are plain GET query params (shareable URLs) |
| AI integration | `lib/ai.ts`: OpenAI-compatible chat completion when `OPENAI_API_KEY` is set, deterministic insights engine otherwise — the UI never knows the difference |
| API | `GET /api/ai/digest` |

## Run it

```bash
npm install
npm run build && npm start     # or: npm run dev
```

Optional: `OPENAI_API_KEY=*** npm start` upgrades the digest panel (also honors `OPENAI_BASE_URL` / `OPENAI_MODEL` for any OpenAI-compatible gateway).

Demo data is synthetic; first run seeds `data/ledger.db` (gitignored).

---

Built by a senior engineer — 20+ years web products, ex-Product Owner / EM of
Cacoo. Need a feature like this wired into *your* app, or a week-long MVP from
scratch? Same discipline, your codebase.
