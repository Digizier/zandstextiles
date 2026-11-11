import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cggazaeacgprzcchxmyt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZ2F6YWVhY2dwcnpjY2h4bXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzMzIyNDIsImV4cCI6MjEwOTkwODI0Mn0.3Ywj8tsiaRrPN27pHRCKS_whRQcQTGpHK1e58laxdt8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
