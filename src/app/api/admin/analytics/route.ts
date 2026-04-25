import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
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

    // Total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Active users (last 7 days)
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Live users (last 2 minutes)
    const { count: liveUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', new Date(Date.now() - 2 * 60 * 1000).toISOString());

    // Total searches
    const { count: totalSearches } = await supabase
      .from('searches')
      .select('*', { count: 'exact', head: true });

    // Total domain audits
    const { count: totalAudits } = await supabase
      .from('domain_audits')
      .select('*', { count: 'exact', head: true });

    // Total API tokens
    const { data: apiLogs } = await supabase
      .from('api_logs')
      .select('tokens_used');

    const totalTokens = apiLogs?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;

    // Searches this week
    const { count: weeklySearches } = await supabase
      .from('searches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Audits this week
    const { count: weeklyAudits } = await supabase
      .from('domain_audits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Search trend (last 7 days)
    const { data: recentSearches } = await supabase
      .from('searches')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at');

    const dailySearches: Record<string, number> = {};
    recentSearches?.forEach((s) => {
      const day = new Date(s.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      dailySearches[day] = (dailySearches[day] || 0) + 1;
    });

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      liveUsers: liveUsers || 0,
      totalSearches: totalSearches || 0,
      totalAudits: totalAudits || 0,
      weeklySearches: weeklySearches || 0,
      weeklyAudits: weeklyAudits || 0,
      totalTokens,
      dailySearches,
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
