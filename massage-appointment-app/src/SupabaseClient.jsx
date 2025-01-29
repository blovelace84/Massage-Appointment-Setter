import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://czlwtwussozsmjncebrw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bHd0d3Vzc296c21qbmNlYnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNjE5NDgsImV4cCI6MjA1MzYzNzk0OH0.A4Fxl8QLrpjTspyB8HfwUkey6JA9u80WMiOQiMHwtSU';
export const supabase = createClient(supabaseUrl, supabaseKey);
