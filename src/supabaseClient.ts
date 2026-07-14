import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase 연결 설정이 누락되었습니다. .env 파일을 작성하거나 환경 변수를 설정해 주세요.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
