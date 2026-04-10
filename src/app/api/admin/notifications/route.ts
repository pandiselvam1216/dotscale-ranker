import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

    const { user_id, title, message, is_broadcast } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    if (is_broadcast) {
      // Send to all users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id');

      const notifications = (allUsers || []).map((u) => ({
        user_id: u.id,
        title,
        message,
        is_broadcast: true,
      }));

      await supabase.from('notifications').insert(notifications);
    } else {
      if (!user_id) {
        return NextResponse.json({ error: 'user_id is required for single notification' }, { status: 400 });
      }

      await supabase.from('notifications').insert({
        user_id,
        title,
        message,
        is_broadcast: false,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
