import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return profile?.role === 'admin';
}

export async function GET() {
  try {
    const supabase = await createClient();
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users with their search counts
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Enrich with search counts and session data
    const enrichedUsers = await Promise.all(
      (users || []).map(async (user) => {
        const { count: searchCount } = await supabase
          .from('searches')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: auditCount } = await supabase
          .from('domain_audits')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { data: apiLogs } = await supabase
          .from('api_logs')
          .select('tokens_used')
          .eq('user_id', user.id);

        const totalTokens = apiLogs?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;

        // Get session data
        const { data: sessions } = await supabase
          .from('user_sessions')
          .select('started_at, last_active_at, duration_seconds, is_active')
          .eq('user_id', user.id)
          .order('last_active_at', { ascending: false });

        const activeSessions = sessions?.filter(s => s.is_active) || [];
        const isOnline = activeSessions.length > 0 &&
          new Date(activeSessions[0]?.last_active_at).getTime() > Date.now() - 2 * 60 * 1000;

        // Calculate total time from last_seen_at
        const totalSessionSeconds = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;

        // Check if user was active in last 2 minutes via last_seen_at
        const lastSeenRecent = user.last_seen_at &&
          new Date(user.last_seen_at).getTime() > Date.now() - 2 * 60 * 1000;

        return {
          ...user,
          search_count: searchCount || 0,
          audit_count: auditCount || 0,
          total_tokens: totalTokens,
          is_online: isOnline || lastSeenRecent,
          last_active: user.last_seen_at,
          total_session_seconds: user.total_session_seconds || totalSessionSeconds,
        };
      })
    );

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id, action, data } = await request.json();

    if (action === 'block') {
      await supabase.from('profiles').update({ is_blocked: true }).eq('id', user_id);
    } else if (action === 'unblock') {
      await supabase.from('profiles').update({ is_blocked: false }).eq('id', user_id);
    } else if (action === 'update') {
      await supabase.from('profiles').update(data).eq('id', user_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
