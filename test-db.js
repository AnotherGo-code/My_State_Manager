const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testing database connection...');

  try {
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth test:', { hasSession: !!authData?.session, error: authError?.message });

    // Test tables
    const tables = ['tasks', 'logs', 'schedule'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      console.log(`${table} table:`, { count: data?.length || 0, error: error?.message });
    }

    console.log('Connection test completed');
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testConnection();