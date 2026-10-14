import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

export type TaskRow = {
  id: string;
  device_id: string;
  title: string;
  completed: boolean;
  created_at: number;
};

export function createSupabaseClient(deviceId: string) {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw new Error('Supabase project settings are missing.');
  }

  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-device-id': deviceId,
      },
    },
  });
}
