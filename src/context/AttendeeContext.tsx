import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Attendee, PrintLog, PrintSettings, PreQna, PreSurvey } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback RFC4122 version 4 UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};


interface AttendeeContextType {
  attendees: Attendee[];
  printLogs: PrintLog[];
  preQnas: PreQna[];
  preSurveys: PreSurvey[];
  isLoading: boolean;
  dbError: string | null;
  deskId: string;
  setDeskId: (id: string) => void;
  isLoggedIn: boolean;
  userRole: 'admin' | 'desk' | null;
  login: (password: string) => boolean;
  logout: () => void;
  settings: PrintSettings;
  updateSettings: (newSettings: PrintSettings) => void;
  addAttendee: (attendee: Omit<Attendee, 'id' | 'code' | 'isAttended' | 'printedCount' | 'registeredType'> & { 
    registeredType?: '사전' | '현장';
    isAttended?: boolean;
    printedCount?: number;
    printedBy?: string;
  }) => Attendee;
  importAttendees: (newAttendees: Omit<Attendee, 'id' | 'isAttended' | 'printedCount' | 'registeredType'>[]) => void;
  printAttendee: (id: string) => void;
  clearAllData: () => void;
  generateDummyData: () => void;
  addPreQna: (qna: Omit<PreQna, 'id' | 'createdAt' | 'isReviewed'>) => PreQna;
  addPreSurvey: (survey: Omit<PreSurvey, 'id' | 'createdAt'>) => PreSurvey;
  toggleQnaReviewed: (id: string) => void;
  clearPortalData: () => void;
}


const AttendeeContext = createContext<AttendeeContextType | undefined>(undefined);

const INITIAL_ATTENDEES: Attendee[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: '10001',
    type: 'VIP',
    organization: '고양컨벤션뷰로',
    position: '이사장',
    name: '김고양',
    phone: '010-2026-1001',
    email: 'goyang.kim@gdw.or.kr',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: '10002',
    type: '연사',
    organization: '한국관광공사',
    position: '본부장',
    name: '이한국',
    phone: '010-2026-1002',
    email: 'hk.lee@knto.or.kr',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    code: '10003',
    type: 'VIP',
    organization: 'International Congress and Convention Association',
    position: 'CEO',
    name: 'Senthil Gopinath',
    phone: '+31-20-398-1900',
    email: 'ceo@iccaworld.org',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    code: '10004',
    type: '일반',
    organization: '경희대학교 MICE학과',
    position: '교수',
    name: '박경희',
    phone: '010-2026-1004',
    email: 'kh.park@khu.ac.kr',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    code: '10005',
    type: '일반',
    organization: '킨텍스(KINTEX)',
    position: '차장',
    name: '정킨텍',
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    code: '10006',
    type: '스태프',
    organization: '플랜트포유 대행사',
    position: '운영요원',
    name: '최운영',
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    code: '10007',
    type: '기자',
    organization: 'MICE 매거진',
    position: '기자',
    name: '홍기자',
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    code: '10008',
    type: '연사',
    organization: 'MCI Group Korea',
    position: '대표',
    name: 'Alex Hwang',
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    code: '10009',
    type: '일반',
    organization: '고양시청 MICE산업과',
    position: '주무관',
    name: '지고양',
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    code: '10010',
    type: '스태프',
    organization: '킨텍스 보안팀',
    position: '팀장',
    name: '강보안',
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  }
];

// --- Mapping Helpers for Supabase DB (snake_case) to Frontend Types (camelCase) ---
const mapDbToAttendee = (db: any): Attendee => ({
  id: db.id,
  code: db.code,
  type: db.type,
  organization: db.organization,
  position: db.position || '',
  name: db.name,
  phone: db.phone || undefined,
  email: db.email || undefined,
  privacyAgree: db.privacy_agree ?? false,
  isAttended: db.is_attended ?? false,
  attendedAt: db.attended_at || undefined,
  registeredType: db.registered_type as '사전' | '현장',
  printedCount: db.printed_count ?? 0,
  printedBy: db.printed_by || undefined,
});

const mapAttendeeToDb = (att: Attendee) => ({
  id: att.id,
  code: att.code,
  type: att.type,
  organization: att.organization,
  position: att.position || null,
  name: att.name,
  phone: att.phone || null,
  email: att.email || null,
  privacy_agree: att.privacyAgree ?? false,
  is_attended: att.isAttended ?? false,
  attended_at: att.attendedAt || null,
  registered_type: att.registeredType,
  printed_count: att.printedCount ?? 0,
  printed_by: att.printedBy || null,
});

const mapDbToPrintLog = (db: any): PrintLog => ({
  id: db.id,
  attendeeId: db.attendee_id,
  name: db.name,
  organization: db.organization,
  type: db.type,
  printedAt: db.printed_at,
  deskId: db.desk_id,
  registeredType: db.registered_type as '사전' | '현장',
});

const mapPrintLogToDb = (log: PrintLog) => ({
  id: log.id,
  attendee_id: log.attendeeId,
  name: log.name,
  organization: log.organization,
  type: log.type,
  printed_at: log.printedAt,
  desk_id: log.deskId,
  registered_type: log.registeredType,
});

const mapDbToPreQna = (db: any): PreQna => ({
  id: db.id,
  name: db.name,
  organization: db.organization,
  question: db.question,
  createdAt: db.created_at,
  isReviewed: db.is_reviewed ?? false,
});

const mapPreQnaToDb = (qna: PreQna) => ({
  id: qna.id,
  name: qna.name,
  organization: qna.organization,
  question: qna.question,
  created_at: qna.createdAt,
  is_reviewed: qna.isReviewed,
});

const mapDbToPreSurvey = (db: any): PreSurvey => ({
  id: db.id,
  name: db.name || undefined,
  organization: db.organization || undefined,
  rating: db.rating,
  satisfaction: db.satisfaction,
  interestAreas: db.interest_areas || [],
  suggestions: db.suggestions || '',
  createdAt: db.created_at,
});

const mapPreSurveyToDb = (survey: PreSurvey) => ({
  id: survey.id,
  name: survey.name || null,
  organization: survey.organization || null,
  rating: survey.rating,
  satisfaction: survey.satisfaction,
  interest_areas: survey.interestAreas,
  suggestions: survey.suggestions || null,
  created_at: survey.createdAt,
});


export const AttendeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [printLogs, setPrintLogs] = useState<PrintLog[]>([]);
  const [preQnas, setPreQnas] = useState<PreQna[]>([]);
  const [preSurveys, setPreSurveys] = useState<PreSurvey[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [useLocalStorage, setUseLocalStorage] = useState<boolean>(!isSupabaseConfigured);
  const [deskId, setDeskIdState] = useState<string>('Desk-01');
  const [settings, setSettingsState] = useState<PrintSettings>({ pageWidth: 80, pageHeight: 50 });
  
  // 로그인 상태 추가
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'desk' | null>(null);

  const channel = React.useMemo(() => new BroadcastChannel('mice_idcard_sync'), []);

  // Settings Load Utility
  const loadSettingsFromLocalStorage = () => {
    const savedSettings = localStorage.getItem('mice_print_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettingsState(parsed);
      document.documentElement.style.setProperty('--page-width', `${parsed.pageWidth}mm`);
      document.documentElement.style.setProperty('--page-height', `${parsed.pageHeight}mm`);
    } else {
      setSettingsState({ pageWidth: 80, pageHeight: 50 });
      document.documentElement.style.setProperty('--page-width', '80mm');
      document.documentElement.style.setProperty('--page-height', '50mm');
    }
  };

  // LocalStorage Fallback Loader for Attendees & Print Logs
  const loadFromLocalStorageFallback = () => {
    const savedAttendees = localStorage.getItem('mice_attendees');
    const savedLogs = localStorage.getItem('mice_print_logs');
    const savedQnas = localStorage.getItem('mice_pre_qnas');
    const savedSurveys = localStorage.getItem('mice_pre_surveys');
    
    if (savedAttendees) {
      setAttendees(JSON.parse(savedAttendees));
    } else {
      setAttendees(INITIAL_ATTENDEES);
      localStorage.setItem('mice_attendees', JSON.stringify(INITIAL_ATTENDEES));
    }

    if (savedLogs) {
      setPrintLogs(JSON.parse(savedLogs));
    } else {
      setPrintLogs([]);
      localStorage.setItem('mice_print_logs', JSON.stringify([]));
    }

    if (savedQnas) {
      setPreQnas(JSON.parse(savedQnas));
    } else {
      setPreQnas([]);
      localStorage.setItem('mice_pre_qnas', JSON.stringify([]));
    }

    if (savedSurveys) {
      setPreSurveys(JSON.parse(savedSurveys));
    } else {
      setPreSurveys([]);
      localStorage.setItem('mice_pre_surveys', JSON.stringify([]));
    }
    setIsLoading(false);
  };

  // Helper to wrap promise with timeout
  const withTimeout = async (promise: Promise<any>, timeoutMs: number = 4000): Promise<any> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
      ),
    ]);
  };

  // Fetch all data from Supabase
  const fetchAllData = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const isPublicView = window.location.search.includes('view=public-register');
      const searchParams = new URLSearchParams(window.location.search);
      const codeParam = searchParams.get('code');

      if (isPublicView) {
        if (codeParam) {
          // [초특급 최적화 1] 일반 모바일 티켓 조회 화면에서는 전체 목록을 가져오지 않고, 오직 해당 티켓 코드의 정보만 단건 조회합니다!
          let { data, error } = await withTimeout(
            supabase
              .from('attendees')
              .select('*')
              .eq('code', codeParam)
              .maybeSingle(),
            4000
          );

          if (error) {
            console.warn('모바일 티켓 단건 조회 실패:', error);
            setAttendees([]);
            setDbError('티켓 조회 중 오류가 발생했습니다.');
            throw error;
          } else if (data) {
            setAttendees([mapDbToAttendee(data)]);
          } else {
            // 조회가 되지 않는 경우, DB가 비어있는 상태인지 확인 후 자동 Seeding을 진행합니다.
            const { count, error: countError } = await withTimeout(
              supabase
                .from('attendees')
                .select('*', { count: 'exact', head: true }),
              4000
            );
            
            if (!countError && count === 0) {
              console.log('Supabase가 비어 있어 모바일 접속 시점에 초기 데이터를 주입(seeding)합니다.');
              const dbAttendees = INITIAL_ATTENDEES.map(mapAttendeeToDb);
              const { error: seedError } = await withTimeout(
                supabase
                  .from('attendees')
                  .insert(dbAttendees),
                4000
              );
              
              if (!seedError) {
                const { data: freshData } = await withTimeout(
                  supabase
                    .from('attendees')
                    .select('*')
                    .eq('code', codeParam)
                    .maybeSingle(),
                  4000
                );
                if (freshData) {
                  setAttendees([mapDbToAttendee(freshData)]);
                } else {
                  setAttendees([]);
                  setDbError('등록 정보를 찾을 수 없습니다.');
                }
              } else {
                setAttendees([]);
                setDbError('초기 데이터 주입 실패로 조회할 수 없습니다.');
                throw seedError;
              }
            } else {
              setAttendees([]);
              setDbError('등록 정보를 찾을 수 없습니다.');
            }
          }
        } else {
          // [초특급 최적화 2] 모바일 등록 폼 화면에서는 전체 목록을 가져올 필요가 없으므로,
          // 코드 번호 자동 생성을 위해 현재 저장된 가장 큰 코드 정보 1건만 조회합니다.
          const { data, error } = await withTimeout(
            supabase
              .from('attendees')
              .select('code')
              .order('code', { ascending: false })
              .limit(1),
            4000
          );

          if (error) {
            console.warn('모바일 등록 코드 조회 실패:', error);
            setAttendees([]);
          } else if (data && data.length > 0) {
            setAttendees([{ code: data[0].code } as any]);
          } else {
            setAttendees([]);
          }
        }
        setPrintLogs([]);
      } else {
        // 관리자/데스크 화면에서는 기존처럼 전체 데이터를 수집
        // [병렬 최적화] 네 테이블 조회를 동시에 처리하되, 일부 테이블 부재 시 개별적으로 폴백 처리합니다.
        const [attResult, logResult, qnaResult, surveyResult] = await Promise.all([
          withTimeout(
            supabase
              .from('attendees')
              .select('*')
              .order('created_at', { ascending: false }),
            5000
          ).catch(err => ({ error: err, data: null })),
          withTimeout(
            supabase
              .from('print_logs')
              .select('*')
              .order('printed_at', { ascending: false }),
            5000
          ).catch(err => ({ error: err, data: null })),
          withTimeout(
            supabase
              .from('pre_qnas')
              .select('*')
              .order('created_at', { ascending: false }),
            5000
          ).catch(err => ({ error: err, data: null })),
          withTimeout(
            supabase
              .from('pre_surveys')
              .select('*')
              .order('created_at', { ascending: false }),
            5000
          ).catch(err => ({ error: err, data: null }))
        ]);

        const { data: attData, error: attError } = attResult as any;
        const { data: logData, error: logError } = logResult as any;
        const { data: qnaData, error: qnaError } = qnaResult as any;
        const { data: surveyData, error: surveyError } = surveyResult as any;

        if (attError) throw attError;
        if (logError) throw logError;

        const mappedAttendees = (attData || []).map(mapDbToAttendee);
        const mappedLogs = (logData || []).map(mapDbToPrintLog);

        if (qnaError) {
          console.warn('Supabase pre_qnas 테이블 조회 실패. 로컬 폴백을 시도합니다:', qnaError);
          const savedQnas = localStorage.getItem('mice_pre_qnas');
          setPreQnas(savedQnas ? JSON.parse(savedQnas) : []);
        } else {
          setPreQnas((qnaData || []).map(mapDbToPreQna));
        }

        if (surveyError) {
          console.warn('Supabase pre_surveys 테이블 조회 실패. 로컬 폴백을 시도합니다:', surveyError);
          const savedSurveys = localStorage.getItem('mice_pre_surveys');
          setPreSurveys(savedSurveys ? JSON.parse(savedSurveys) : []);
        } else {
          setPreSurveys((surveyData || []).map(mapDbToPreSurvey));
        }

        if (mappedAttendees.length === 0) {
          console.log('Supabase가 비어 있어 초기 데이터를 주입(seeding)합니다.');
          const dbAttendees = INITIAL_ATTENDEES.map(mapAttendeeToDb);
          const { error: seedError } = await withTimeout(
            supabase
              .from('attendees')
              .insert(dbAttendees),
            5000
          );
          
          if (seedError) {
            console.error('더미 데이터 주입 실패:', seedError);
            throw seedError;
          } else {
            const { data: freshAtt } = await withTimeout(
              supabase
                .from('attendees')
                .select('*')
                .order('created_at', { ascending: false }),
              5000
            );
            setAttendees((freshAtt || []).map(mapDbToAttendee));
          }
        } else {
          setAttendees(mappedAttendees);
        }

        setPrintLogs(mappedLogs);
      }
    } catch (err: any) {
      console.error('Supabase 데이터 로드 실패. 로컬 저장소 모드로 대체합니다:', err);
      setUseLocalStorage(true);
      setDbError(
        err.message === 'TIMEOUT'
          ? '데이터베이스 연결 시간이 초과되었습니다.'
          : '데이터베이스 연결에 실패했습니다. (네트워크 상태를 확인해 주세요)'
      );
      loadFromLocalStorageFallback();
    } finally {
      setIsLoading(false);
    }
  };

  // Sync session and settings on mount
  useEffect(() => {
    const savedDeskId = localStorage.getItem('mice_desk_id');
    if (savedDeskId) {
      setDeskIdState(savedDeskId);
    }
    
    // 세션 복구
    const savedSession = localStorage.getItem('mice_auth_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setIsLoggedIn(session.isLoggedIn);
      setUserRole(session.userRole);
    }

    loadSettingsFromLocalStorage();
  }, []);

  // Settings sync listener (always active)
  useEffect(() => {
    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data === 'SYNC_SETTINGS' || event.data === 'SYNC_DATA') {
        loadSettingsFromLocalStorage();
      }
    };

    channel.addEventListener('message', handleSyncMessage);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mice_print_settings') {
        loadSettingsFromLocalStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleSyncMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [channel]);

  // LocalStorage Sync Listener for Attendees/Logs (Only if Supabase is NOT active)
  useEffect(() => {
    if (!useLocalStorage) return;

    loadFromLocalStorageFallback();

    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data === 'SYNC_DATA') {
        loadFromLocalStorageFallback();
      }
    };

    channel.addEventListener('message', handleSyncMessage);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'mice_attendees' || 
        e.key === 'mice_print_logs' ||
        e.key === 'mice_pre_qnas' ||
        e.key === 'mice_pre_surveys'
      ) {
        loadFromLocalStorageFallback();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleSyncMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [channel, useLocalStorage]);

  // Supabase Fetch & Realtime Listener (Only if Supabase is configured)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    fetchAllData();

    // [최적화] 모바일 셀프 등록/티켓 조회/포털 화면 접속 시 실시간 웹소켓 구독을 생략합니다.
    const isPublicView = 
      window.location.search.includes('view=public-register') || 
      window.location.search.includes('view=portal');
    if (isPublicView) {
      console.log('모바일 화면 접속: Supabase Realtime 웹소켓 구독을 생략합니다.');
      return;
    }

    console.log('관리자/데스크 화면 접속: Supabase Realtime 웹소켓 구독을 시작합니다.');

    const channelSubscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendees' },
        (payload: any) => {
          console.log('Attendees Realtime Change:', payload);
          const eventType = payload.eventType;
          const newRecord = payload.new;
          const oldRecord = payload.old;

          if (eventType === 'INSERT') {
            const attendee = mapDbToAttendee(newRecord);
            setAttendees((prev) => {
              if (prev.some((a) => a.id === attendee.id)) return prev;
              return [attendee, ...prev];
            });
          } else if (eventType === 'UPDATE') {
            const attendee = mapDbToAttendee(newRecord);
            setAttendees((prev) =>
              prev.map((a) => (a.id === attendee.id ? attendee : a))
            );
          } else if (eventType === 'DELETE') {
            setAttendees((prev) => prev.filter((a) => a.id !== oldRecord.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'print_logs' },
        (payload: any) => {
          console.log('Print Logs Realtime Change:', payload);
          const eventType = payload.eventType;
          const newRecord = payload.new;
          const oldRecord = payload.old;

          if (eventType === 'INSERT') {
            const log = mapDbToPrintLog(newRecord);
            setPrintLogs((prev) => {
              if (prev.some((l) => l.id === log.id)) return prev;
              return [log, ...prev];
            });
          } else if (eventType === 'DELETE') {
            setPrintLogs((prev) => prev.filter((l) => l.id !== oldRecord.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pre_qnas' },
        (payload: any) => {
          console.log('PreQnas Realtime Change:', payload);
          const eventType = payload.eventType;
          const newRecord = payload.new;
          const oldRecord = payload.old;

          if (eventType === 'INSERT') {
            const qna = mapDbToPreQna(newRecord);
            setPreQnas((prev) => {
              if (prev.some((q) => q.id === qna.id)) return prev;
              return [qna, ...prev];
            });
          } else if (eventType === 'UPDATE') {
            const qna = mapDbToPreQna(newRecord);
            setPreQnas((prev) =>
              prev.map((q) => (q.id === qna.id ? qna : q))
            );
          } else if (eventType === 'DELETE') {
            setPreQnas((prev) => prev.filter((q) => q.id !== oldRecord.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pre_surveys' },
        (payload: any) => {
          console.log('PreSurveys Realtime Change:', payload);
          const eventType = payload.eventType;
          const newRecord = payload.new;
          const oldRecord = payload.old;

          if (eventType === 'INSERT') {
            const survey = mapDbToPreSurvey(newRecord);
            setPreSurveys((prev) => {
              if (prev.some((s) => s.id === survey.id)) return prev;
              return [survey, ...prev];
            });
          } else if (eventType === 'DELETE') {
            setPreSurveys((prev) => prev.filter((s) => s.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, []);

  const setDeskId = (id: string) => {
    setDeskIdState(id);
    localStorage.setItem('mice_desk_id', id);
  };

  const login = (password: string): boolean => {
    // 비밀번호 정의
    const passwords: Record<string, { deskId: string; role: 'admin' | 'desk' }> = {
      'gdw2026admin': { deskId: 'Desk-01', role: 'admin' }, // 마스터
      'gdw2026d1': { deskId: 'Desk-01', role: 'desk' },
      'gdw2026d2': { deskId: 'Desk-02', role: 'desk' },
      'gdw2026d3': { deskId: 'Desk-03', role: 'desk' },
      'gdw2026d4': { deskId: 'Desk-04', role: 'desk' },
    };

    const target = passwords[password.trim()];
    if (target) {
      setIsLoggedIn(true);
      setUserRole(target.role);
      setDeskId(target.deskId);
      
      localStorage.setItem('mice_auth_session', JSON.stringify({
        isLoggedIn: true,
        userRole: target.role,
        deskId: target.deskId
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('mice_auth_session');
  };

  const updateSettings = (newSettings: PrintSettings) => {
    setSettingsState(newSettings);
    localStorage.setItem('mice_print_settings', JSON.stringify(newSettings));
    
    // CSS 변수 즉시 주입
    document.documentElement.style.setProperty('--page-width', `${newSettings.pageWidth}mm`);
    document.documentElement.style.setProperty('--page-height', `${newSettings.pageHeight}mm`);
    
    channel.postMessage('SYNC_SETTINGS');
  };

  const saveAndBroadcast = (updatedAttendees: Attendee[], updatedLogs: PrintLog[]) => {
    localStorage.setItem('mice_attendees', JSON.stringify(updatedAttendees));
    localStorage.setItem('mice_print_logs', JSON.stringify(updatedLogs));
    setAttendees(updatedAttendees);
    setPrintLogs(updatedLogs);
    channel.postMessage('SYNC_DATA');
  };

  const addAttendee = (
    newAtt: Omit<Attendee, 'id' | 'code' | 'isAttended' | 'printedCount' | 'registeredType'> & { 
      registeredType?: '사전' | '현장';
      isAttended?: boolean;
      printedCount?: number;
      printedBy?: string;
    }
  ) => {
    const codes = attendees.map(a => parseInt(a.code, 10)).filter(c => !isNaN(c));
    const nextCode = codes.length > 0 ? Math.max(...codes) + 1 : 10001;
    
    const created: Attendee = {
      ...newAtt,
      id: generateUUID(),
      code: String(nextCode),
      isAttended: newAtt.isAttended ?? false,
      attendedAt: newAtt.isAttended ? new Date().toISOString() : undefined,
      printedCount: newAtt.printedCount ?? 0,
      printedBy: newAtt.printedBy,
      registeredType: newAtt.registeredType || '현장'
    };

    let newLog: PrintLog | null = null;
    if (created.isAttended && created.printedCount > 0) {
      newLog = {
        id: generateUUID(),
        attendeeId: created.id,
        name: created.name,
        organization: created.organization,
        type: created.type,
        printedAt: new Date().toISOString(),
        deskId: created.printedBy || deskId,
        registeredType: created.registeredType
      };
    }

    if (!useLocalStorage) {
      const promises = [
        supabase
          .from('attendees')
          .insert(mapAttendeeToDb(created))
      ];
      if (newLog) {
        promises.push(
          supabase
            .from('print_logs')
            .insert(mapPrintLogToDb(newLog))
        );
      }
      
      Promise.all(promises).then((results: any[]) => {
        results.forEach((res, index) => {
          if (res.error) {
            console.error(`Supabase addAttendee/printLog 에러 [${index}]:`, res.error);
          }
        });
      });
      
      setAttendees(prev => {
        if (prev.some(a => a.id === created.id)) return prev;
        return [created, ...prev];
      });

      if (newLog) {
        const log = newLog;
        setPrintLogs(prev => {
          if (prev.some(l => l.id === log.id)) return prev;
          return [log, ...prev];
        });
      }
    } else {
      const updatedAttendees = [created, ...attendees];
      const updatedLogs = newLog ? [newLog, ...printLogs] : printLogs;
      saveAndBroadcast(updatedAttendees, updatedLogs);
    }
    return created;
  };

  const importAttendees = (
    newAttendees: Omit<Attendee, 'id' | 'isAttended' | 'printedCount' | 'registeredType'>[]
  ) => {
    const codes = attendees.map(a => parseInt(a.code, 10)).filter(c => !isNaN(c));
    let startCode = codes.length > 0 ? Math.max(...codes) + 1 : 10001;

    const imported: Attendee[] = newAttendees.map(att => {
      const currentCode = att.code || String(startCode++);
      return {
        ...att,
        id: generateUUID(),
        code: currentCode,
        isAttended: false,
        printedCount: 0,
        registeredType: '사전'
      };
    });

    if (!useLocalStorage) {
      const dbAttendees = imported.map(mapAttendeeToDb);
      supabase
        .from('attendees')
        .insert(dbAttendees)
        .then(({ error }: any) => {
          if (error) {
            console.error('Supabase importAttendees 에러:', error);
          }
        });
      setAttendees(prev => [...prev, ...imported]);
    } else {
      const updated = [...attendees, ...imported];
      saveAndBroadcast(updated, printLogs);
    }
  };

  const printAttendee = (id: string) => {
    const target = attendees.find(a => a.id === id);
    if (!target) return;

    const updatedAttendee: Attendee = {
      ...target,
      isAttended: true,
      attendedAt: target.attendedAt || new Date().toISOString(),
      printedCount: target.printedCount + 1,
      printedBy: deskId
    };

    const newLog: PrintLog = {
      id: generateUUID(),
      attendeeId: target.id,
      name: target.name,
      organization: target.organization,
      type: target.type,
      printedAt: new Date().toISOString(),
      deskId: deskId,
      registeredType: target.registeredType
    };

    if (!useLocalStorage) {
      Promise.all([
        supabase
          .from('attendees')
          .update(mapAttendeeToDb(updatedAttendee))
          .eq('id', id),
        supabase
          .from('print_logs')
          .insert(mapPrintLogToDb(newLog))
      ]).then(([attRes, logRes]: [any, any]) => {
        if (attRes.error) console.error('Supabase print update error:', attRes.error);
        if (logRes.error) console.error('Supabase print log insert error:', logRes.error);
      });

      setAttendees(prev => prev.map(a => a.id === id ? updatedAttendee : a));
      setPrintLogs(prev => {
        if (prev.some(l => l.id === newLog.id)) return prev;
        return [newLog, ...prev];
      });
    } else {
      const updatedAttendees = attendees.map(att => att.id === id ? updatedAttendee : att);
      const updatedLogs = [newLog, ...printLogs];
      saveAndBroadcast(updatedAttendees, updatedLogs);
    }
  };

  const clearAllData = () => {
    if (!useLocalStorage) {
      Promise.all([
        supabase.from('print_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('attendees').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]).then(([logRes, attRes]: [any, any]) => {
        if (logRes.error) console.error('Supabase clear print_logs error:', logRes.error);
        if (attRes.error) console.error('Supabase clear attendees error:', attRes.error);
      });
      setAttendees([]);
      setPrintLogs([]);
    } else {
      localStorage.removeItem('mice_attendees');
      localStorage.removeItem('mice_print_logs');
      setAttendees([]);
      setPrintLogs([]);
      channel.postMessage('SYNC_DATA');
    }
  };

  const generateDummyData = () => {
    if (!useLocalStorage) {
      Promise.all([
        supabase.from('print_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('attendees').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]).then(async () => {
        const dbAttendees = INITIAL_ATTENDEES.map(mapAttendeeToDb);
        const { error }: any = await supabase.from('attendees').insert(dbAttendees);
        if (error) {
          console.error('Supabase generateDummyData insert error:', error);
        }
      });
      setAttendees(INITIAL_ATTENDEES);
      setPrintLogs([]);
    } else {
      localStorage.setItem('mice_attendees', JSON.stringify(INITIAL_ATTENDEES));
      localStorage.setItem('mice_print_logs', JSON.stringify([]));
      setAttendees(INITIAL_ATTENDEES);
      setPrintLogs([]);
      channel.postMessage('SYNC_DATA');
    }
  };

  const addPreQna = (qna: Omit<PreQna, 'id' | 'createdAt' | 'isReviewed'>): PreQna => {
    const created: PreQna = {
      ...qna,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      isReviewed: false,
    };

    if (!useLocalStorage) {
      supabase
        .from('pre_qnas')
        .insert(mapPreQnaToDb(created))
        .then(({ error }: any) => {
          if (error) console.error('Supabase addPreQna error:', error);
        });
      setPreQnas((prev) => [created, ...prev]);
    } else {
      const updated = [created, ...preQnas];
      localStorage.setItem('mice_pre_qnas', JSON.stringify(updated));
      setPreQnas(updated);
      channel.postMessage('SYNC_DATA');
    }
    return created;
  };

  const addPreSurvey = (survey: Omit<PreSurvey, 'id' | 'createdAt'>): PreSurvey => {
    const created: PreSurvey = {
      ...survey,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };

    if (!useLocalStorage) {
      supabase
        .from('pre_surveys')
        .insert(mapPreSurveyToDb(created))
        .then(({ error }: any) => {
          if (error) console.error('Supabase addPreSurvey error:', error);
        });
      setPreSurveys((prev) => [created, ...prev]);
    } else {
      const updated = [created, ...preSurveys];
      localStorage.setItem('mice_pre_surveys', JSON.stringify(updated));
      setPreSurveys(updated);
      channel.postMessage('SYNC_DATA');
    }
    return created;
  };

  const toggleQnaReviewed = (id: string) => {
    const target = preQnas.find((q) => q.id === id);
    if (!target) return;

    const updatedQna: PreQna = {
      ...target,
      isReviewed: !target.isReviewed,
    };

    if (!useLocalStorage) {
      supabase
        .from('pre_qnas')
        .update({ is_reviewed: updatedQna.isReviewed })
        .eq('id', id)
        .then(({ error }: any) => {
          if (error) console.error('Supabase update preQna error:', error);
        });
      setPreQnas((prev) => prev.map((q) => (q.id === id ? updatedQna : q)));
    } else {
      const updated = preQnas.map((q) => (q.id === id ? updatedQna : q));
      localStorage.setItem('mice_pre_qnas', JSON.stringify(updated));
      setPreQnas(updated);
      channel.postMessage('SYNC_DATA');
    }
  };

  const clearPortalData = () => {
    if (!useLocalStorage) {
      Promise.all([
        supabase.from('pre_qnas').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('pre_surveys').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]).then(([qnaRes, surveyRes]: [any, any]) => {
        if (qnaRes.error) console.error('Supabase clear pre_qnas error:', qnaRes.error);
        if (surveyRes.error) console.error('Supabase clear pre_surveys error:', surveyRes.error);
      });
      setPreQnas([]);
      setPreSurveys([]);
    } else {
      localStorage.removeItem('mice_pre_qnas');
      localStorage.removeItem('mice_pre_surveys');
      setPreQnas([]);
      setPreSurveys([]);
      channel.postMessage('SYNC_DATA');
    }
  };

  return (
    <AttendeeContext.Provider value={{
      attendees,
      printLogs,
      preQnas,
      preSurveys,
      isLoading,
      dbError,
      deskId,
      setDeskId,
      isLoggedIn,
      userRole,
      login,
      logout,
      settings,
      updateSettings,
      addAttendee,
      importAttendees,
      printAttendee,
      clearAllData,
      generateDummyData,
      addPreQna,
      addPreSurvey,
      toggleQnaReviewed,
      clearPortalData
    }}>
      {children}
    </AttendeeContext.Provider>
  );
};

export const useAttendees = () => {
  const context = useContext(AttendeeContext);
  if (!context) {
    throw new Error('useAttendees must be used within an AttendeeProvider');
  }
  return context;
};
