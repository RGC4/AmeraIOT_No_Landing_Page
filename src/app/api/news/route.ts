import { NextResponse } from 'next/server';
import { getNewsFeed } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getNewsFeed();
  return NextResponse.json(result);
}
