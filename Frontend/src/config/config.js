const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = isDevelopment 
  ? 'http://localhost:5000'
  : 'https://shxplstyxjippikogpwc.supabase.co'; 

export const SUPABASE_URL = 'https://shxplstyxjippikogpwc.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeHBsc3R5eGppcHBpa29ncHdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MTc4NzYsImV4cCI6MjA1NzE5Mzg3Nn0.oXcTbNLn09jdgtKdZupu9ea6Dct2QSbyCS2nRuZhs-k';

export const supabaseHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
}; 