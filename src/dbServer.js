

import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://ezmvecxqcjnrspmjfgkk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bXZlY3hxY2pucnNwbWpmZ2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MjUzMzMsImV4cCI6MjA3MDEwMTMzM30.M0ZsDxmJRc7EFe3uzRFmy69TymcsdwMbV54jkay29tI'


export const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
        auth: {
            storageKey: 'silverstar-auth-store',
            persistSession: true
        }
    }
);