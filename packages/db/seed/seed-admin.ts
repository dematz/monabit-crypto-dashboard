import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  const email =
    process.argv.find((a) => a.startsWith('--email='))?.split('=')[1] ?? 'admin@monabit.io';
  const password =
    process.argv.find((a) => a.startsWith('--password='))?.split('=')[1] ?? 'Admin123!';

  if (password === 'Admin123!') {
    console.warn('⚠ Using default password — set --password= for production');
  }

  // 1. Create user in Supabase Auth
  const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Admin MonaBit' },
  });

  if (createError) {
    // User might already exist
    if (
      createError.message.includes('already exists') ||
      createError.message.includes('already registered')
    ) {
      console.log(`User ${email} already exists in Auth.`);
    } else {
      console.error('Error creating user:', createError.message);
      process.exit(1);
    }
  } else {
    console.log(`User ${email} created in Auth (id: ${authUser.user.id}).`);
  }

  // 2. Get the user
  const {
    data: { users },
  } = await supabase.auth.admin.listUsers();
  const user = users?.find((u) => u.email === email);

  if (!user) {
    console.error(`User ${email} not found after creation.`);
    process.exit(1);
  }

  // 3. Upsert profile with admin role
  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      display_name: user.user_metadata?.display_name ?? 'Admin',
      role: 'admin',
      is_active: true,
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    console.error('Error upserting profile:', profileError.message);
    process.exit(1);
  }

  console.log(`Profile created for ${email} with role: admin`);
  console.log('Seed completed!');
}

seed();
