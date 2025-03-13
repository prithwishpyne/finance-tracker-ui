import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://epcbscllcljlngiwmcdd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwY2JzY2xsY2xqbG5naXdtY2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MTIyNTgsImV4cCI6MjA1NzE4ODI1OH0.921R0owpr650-eYh5ITAe1cJmCqfPAkQZ76ht-T3E7U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
