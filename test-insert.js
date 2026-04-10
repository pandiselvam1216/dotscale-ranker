require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const { data: user } = await supabase.auth.signInWithPassword({
    email: 'admin@dotscale.com',
    password: 'admin123'
  });
  
  if (user.error) {
    console.error('Login error:', user.error);
    return;
  }

  const { data, error } = await supabase
    .from('searches')
    .insert({ user_id: user.data.user.id, keyword: 'test search bg' })
    .select('id')
    .single();

  console.log('Insert search result:', { data, error });
}

testInsert();
