import { stats } from './queries';
import { formatCents } from './money';

// One integration point, two modes: a real OpenAI-compatible chat completion
// when OPENAI_API_KEY is set, and a deterministic rule-based digest otherwise
// (so the demo always works without keys). The app never knows which one ran.

export type Digest = { text: string; provider: 'openai' | 'insights-engine' };

function ruleDigest(): string {
  const s = stats();
  const worst = s.months.length >= 2 && s.months.at(-1)![1] < s.months.at(-2)![1];
  const lines = [
    `${formatCents(s.revenue30dCents)} invoiced in the last 30 days (JST calendar).`,
    s.outstandingCents > 0
      ? `${formatCents(s.outstandingCents)} still outstanding, ${s.overdueCount} invoice(s) past due — nudge those clients first.`
      : `Nothing outstanding.`,
    `Average time-to-payment is ${s.avgDaysToPay} days.` +
      (s.avgDaysToPay > 5 ? ' Consider offering a small early-payment discount.' : ''),
    worst
      ? `This month trails last month; pipeline review recommended.`
      : `Revenue is holding steady month over month.`,
  ];
  return lines.filter(Boolean).join(' ');
}

async function openAiDigest(): Promise<string> {
  const base = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
  const s = stats();
  const facts = JSON.stringify({
    revenue30dCents: s.revenue30dCents,
    outstandingCents: s.outstandingCents,
    overdueCount: s.overdueCount,
    avgDaysToPay: s.avgDaysToPay,
    monthlyRevenue: s.months,
  });
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      max_tokens: 220,
      messages: [
        { role: 'system', content: 'You are a terse startup CFO. 2-3 sentences of actionable insight from the JSON facts.' },
        { role: 'user', content: facts },
      ],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content.trim();
}

export async function buildDigest(): Promise<Digest> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return { text: await openAiDigest(), provider: 'openai' };
    } catch {
      // fall through — the digest must never break the dashboard
    }
  }
  return { text: ruleDigest(), provider: 'insights-engine' };
}
