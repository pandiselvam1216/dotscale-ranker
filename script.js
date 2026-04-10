require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'admin@dotscale.com');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Profiles data:', JSON.stringify(data, null, 2));
  }
}

checkAdmin();
