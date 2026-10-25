import { NextResponse } from 'next/server';
import { buildDigest } from '@/lib/ai';

export async function GET() {
  return NextResponse.json(await buildDigest());
}
