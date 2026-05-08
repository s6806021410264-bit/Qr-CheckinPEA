// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knjmwmoytlwcrfzosaar.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuam13bW95dGx3Y3Jmem9zYWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTI4MjUsImV4cCI6MjA5MjMyODgyNX0.-SoWMm7EROpbq-rbvXzHIzZL8a4ROQEYMA_-sWkvtPs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
