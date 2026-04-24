
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
  const { data, error } = await supabase.from('profile').select('*').limit(1);
  if (error) {
    console.error('Error fetching profile:', error);
  } else if (data && data.length > 0) {
    console.log('Available columns in profile table:', Object.keys(data[0]));
  } else {
    console.log('No profile data found to check columns.');
  }
}

checkSchema();
