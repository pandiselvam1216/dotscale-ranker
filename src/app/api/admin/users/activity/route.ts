import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user's searches
    const { data: searches } = await supabase
      .from('searches')
      .select('id, keyword, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch user's rank checks combined
    const { data: apiLogs } = await supabase
      .from('api_logs')
      .select('endpoint, tokens_used, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({ searches: searches || [], apiLogs: apiLogs || [] });
  } catch (error) {
    console.error('Admin user activity error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
