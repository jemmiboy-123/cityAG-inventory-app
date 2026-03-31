import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://mdskgzcobtutqyvcamrn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc2tnemNvYnR1dHF5dmNhbXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDE2NjYsImV4cCI6MjA5MDQ3NzY2Nn0.Xke59FEVpfch4Wf8YwiXxU0TOn_iWErbrrPx1cyPtlw'
);

const { data, error } = await supabase.auth.signUp({
    email: 'admin@test.com',
    password: 'Admin1234!',
    options: {
        data: {
            first_name: 'Admin',
            last_name: 'Test',
            ministry: 'Administration',
        },
    },
});

if (error) {
    console.error('Error:', error.message);
} else {
    console.log('User created:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('\nNow go to Supabase Dashboard → Authentication → Users');
    console.log('and confirm the email for admin@test.com');
}
