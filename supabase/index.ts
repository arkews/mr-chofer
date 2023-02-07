import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

export const supabaseUrl = Constants.manifest?.extra?.supabase.url
const supabaseAnonKey = Constants.manifest?.extra?.supabase.key

console.assert(supabaseUrl, 'Missing supabase url')
console.assert(supabaseAnonKey, 'Missing supabase key')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    timeout: 10000
  }
})
