require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with the service role key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixProfiles() {
  try {
    // Get all users using the auth API
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} users`);

    // Add admin profile
    const adminProfile = {
      id: '00000000-0000-0000-0000-000000000000',
      email: process.env.ADMIN_EMAIL,
      created_at: new Date(),
      updated_at: new Date()
    };

    const { error: adminError } = await supabase
      .from('profiles')
      .upsert([adminProfile], { onConflict: 'id' });

    if (adminError) {
      console.error('Error creating admin profile:', adminError);
    } else {
      console.log('Admin profile created/updated');
    }

    // For each user, ensure they have a profile
    for (const user of users) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              created_at: new Date(),
              updated_at: new Date()
            }
          ]);

        if (insertError) {
          console.error(`Error creating profile for ${user.email}:`, insertError);
        } else {
          console.log(`Created profile for ${user.email}`);
        }
      } else {
        console.log(`Profile already exists for ${user.email}`);
      }
    }

    console.log('Profile fix completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

fixProfiles(); 