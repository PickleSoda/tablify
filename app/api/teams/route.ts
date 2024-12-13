import { NextRequest, NextResponse } from 'next/server';
import { getTeamsForUser } from '@/lib/db/queries';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.user.id; 
    const teams = userId && await getTeamsForUser(userId);

    return NextResponse.json({ success: true, teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch teams' }, { status: 500 });
  }
}
