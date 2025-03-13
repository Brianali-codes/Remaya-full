const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = isDevelopment 
  ? 'http://localhost:5000'
  : 'https://shxplstyxjippikogpwc.supabase.co'; 