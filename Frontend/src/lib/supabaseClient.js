import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shxplstyxjippikogpwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeHBsc3R5eGppcHBpa29ncHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MTc4NzYsImV4cCI6MjA1NzE5Mzg3Nn0.oXcTbNLn09jdgtKdZupu9ea6Dct2QSbyCS2nRuZhs-k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 