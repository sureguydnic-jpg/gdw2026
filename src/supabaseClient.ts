import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isPlaceholder =
  !supabaseUrl ||
  supabaseUrl.includes('your-project-id') ||
  !supabaseAnonKey ||
  supabaseAnonKey.includes('your-anon-public-key');

export const isSupabaseConfigured = !isPlaceholder;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase 연결 설정이 누락되었거나 기본 설정입니다. .env 파일을 작성하지 않으면 LocalStorage 모드로 동작합니다.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

