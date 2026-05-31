import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seedAdmin(email: string) {
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users.find((u) => u.email === email);

  if (!user) {
    console.error(`User ${email} not found. Register first.`);
    process.exit(1);
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ role: 'admin' })
    .eq('id', user.id);

  if (error) {
    console.error('Error promoting admin:', error.message);
    process.exit(1);
  }

  console.log(`User ${email} promoted to admin.`);
}

const email = process.argv.find((a) => a.startsWith('--email='))?.split('=')[1];
if (!email) {
  console.error('Usage: pnpm run seed:admin --email=<email>');
  process.exit(1);
}

seedAdmin(email);
