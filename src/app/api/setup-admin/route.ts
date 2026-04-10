import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin setup endpoint — creates the default admin account
// POST /api/setup-admin
export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Use service role key if available, otherwise use anon key
    const keyToUse = supabaseServiceKey || supabaseAnonKey;

    if (!supabaseUrl || !keyToUse) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, keyToUse, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const ADMIN_EMAIL = 'admin@dotscale.com';
    const ADMIN_PASSWORD = 'admin';

    // Try to sign up the admin user
    const { data, error } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: { full_name: 'Admin' },
      },
    });

    if (error) {
      // If user already exists, that's fine
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        // Try to ensure admin role is set
        try {
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('email', ADMIN_EMAIL);
        } catch {
          // Ignore — might not have permission
        }

        return NextResponse.json({
          message: 'Admin account already exists',
          email: ADMIN_EMAIL,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Set admin role in profiles (the trigger should handle this, but just in case)
    if (data.user) {
      try {
        await supabase
          .from('profiles')
          .update({ role: 'admin', full_name: 'Admin' })
          .eq('id', data.user.id);
      } catch {
        // Trigger should handle this
      }
    }

    return NextResponse.json({
      message: 'Admin account created successfully',
      email: ADMIN_EMAIL,
      note: 'Login with admin@dotscale.com / admin',
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Setup failed' },
      { status: 500 }
    );
  }
}
