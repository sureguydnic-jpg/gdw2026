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
  dbStatus: 'online' | 'offline' | 'reconnecting';
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
  isTestMode: boolean;
  toggleTestMode: () => void;
  clearPortalData: () => void;
}


const AttendeeContext = createContext<AttendeeContextType | undefined>(undefined);

const INITIAL_ATTENDEES: Attendee[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: '10001',
    nationality: 'Domestic',
    type: 'Organizer',
    name: 'Stella Lee (이윤희)',
    nameEn: 'Stella Lee',
    nameKr: '이윤희',
    position: 'PM / 매니저',
    positionEn: 'PM',
    positionKr: '매니저',
    organization: 'Goyang CVB / 고양국제박람회재단',
    organizationEn: 'Goyang CVB',
    organizationKr: '고양국제박람회재단',
    phone: '010-2026-1001',
    email: 'stella@gdw.or.kr',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: '10002',
    nationality: 'Foreign',
    type: 'Speaker',
    name: 'Senthil Gopinath',
    nameEn: 'Senthil Gopinath',
    position: 'Chief Executive Officer',
    positionEn: 'Chief Executive Officer',
    organization: 'International Congress and Convention Association',
    organizationEn: 'International Congress and Convention Association',
    phone: '+31-20-398-1900',
    email: 'ceo@iccaworld.org',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    code: '10003',
    nationality: 'Domestic',
    type: 'VIP',
    name: 'Goyang Kim (김고양)',
    nameEn: 'Goyang Kim',
    nameKr: '김고양',
    position: 'Chairman / 이사장',
    positionEn: 'Chairman',
    positionKr: '이사장',
    organization: 'Goyang Destination Bureau / 고양컨벤션뷰로',
    organizationEn: 'Goyang Destination Bureau',
    organizationKr: '고양컨벤션뷰로',
    phone: '010-2026-1003',
    email: 'goyang.kim@gdw.or.kr',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    code: '10004',
    nationality: 'Foreign',
    type: 'VIP',
    name: 'Alexander Bartholomew Montgomery',
    nameEn: 'Alexander Bartholomew Montgomery',
    position: 'Executive Vice President',
    positionEn: 'Executive Vice President',
    organization: 'Global MICE Destination Association',
    organizationEn: 'Global MICE Destination Association',
    phone: '+1-212-555-0199',
    email: 'alexander@gmda-events.org',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    code: '10005',
    nationality: 'Domestic',
    type: 'Attendee',
    name: 'Kyunghee Park (박경희)',
    nameEn: 'Kyunghee Park',
    nameKr: '박경희',
    position: 'Professor / 교수',
    positionEn: 'Professor',
    positionKr: '교수',
    organization: 'Kyunghee University / 경희대학교',
    organizationEn: 'Kyunghee University',
    organizationKr: '경희대학교',
    phone: '010-2026-1004',
    email: 'kh.park@khu.ac.kr',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    code: '10006',
    nationality: 'Foreign',
    type: 'Speaker',
    name: 'Marie Curie-Dupont',
    nameEn: 'Marie Curie-Dupont',
    position: 'Keynote Lecturer',
    positionEn: 'Keynote Lecturer',
    organization: 'Sorbonne Sustainable Tourism Institute',
    organizationEn: 'Sorbonne Sustainable Tourism Institute',
    phone: '+33-1-4268-5500',
    email: 'm.curie@sorbonne.fr',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    code: '10007',
    nationality: 'Domestic',
    type: 'Staff',
    name: 'Woon-young Choi (최운영)',
    nameEn: 'Woon-young Choi',
    nameKr: '최운영',
    position: 'Operator / 운영요원',
    positionEn: 'Operator',
    positionKr: '운영요원',
    organization: 'PlanForYou / 플랜트포유',
    organizationEn: 'PlanForYou',
    organizationKr: '플랜트포유',
    phone: '010-2026-1005',
    email: 'staff@planforyou.co.kr',
    privacyAgree: true,
    isAttended: false,
    registeredType: '사전',
    printedCount: 0,
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    code: '10008',
    nationality: 'Foreign',
    type: 'Press',
    name: 'David K. Miller',
    nameEn: 'David K. Miller',
    position: 'Senior Bureau Editor',
    positionEn: 'Senior Bureau Editor',
    organization: 'MICE International Magazine NY',
    organizationEn: 'MICE International Magazine NY',
    phone: '+1-415-889-2041',
    email: 'david.m@micemagazine.com',
    privacyAgree: true,
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
  nationality: (db.nationality as 'Domestic' | 'Foreign') || (db.name_kr ? 'Domestic' : 'Foreign'),
  organization: db.organization || (db.org_en && db.org_kr ? `${db.org_en} / ${db.org_kr}` : (db.org_en || db.org_kr || '')),
  organizationEn: db.org_en || db.organization_en || undefined,
  organizationKr: db.org_kr || db.organization_kr || undefined,
  position: db.position || (db.position_en && db.position_kr ? `${db.position_en} / ${db.position_kr}` : (db.position_en || db.position_kr || '')),
  positionEn: db.position_en || undefined,
  positionKr: db.position_kr || undefined,
  name: db.name || (db.name_en && db.name_kr ? `${db.name_en} (${db.name_kr})` : (db.name_en || db.name_kr || '')),
  nameEn: db.name_en || undefined,
  nameKr: db.name_kr || undefined,
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
  nationality: att.nationality || (att.nameKr ? 'Domestic' : 'Foreign'),
  name: att.name || (att.nameEn && att.nameKr ? `${att.nameEn} (${att.nameKr})` : (att.nameEn || att.nameKr || '')),
  name_en: att.nameEn || null,
  name_kr: att.nameKr || null,
  position: att.position || (att.positionEn && att.positionKr ? `${att.positionEn} / ${att.positionKr}` : (att.positionEn || att.positionKr || null)),
  position_en: att.positionEn || null,
  position_kr: att.positionKr || null,
  organization: att.organization || (att.organizationEn && att.organizationKr ? `${att.organizationEn} / ${att.organizationKr}` : (att.organizationEn || att.organizationKr || null)),
  org_en: att.organizationEn || null,
  org_kr: att.organizationKr || null,
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
  const [dbStatus, setDbStatus] = useState<'online' | 'offline' | 'reconnecting'>(
    isSupabaseConfigured ? 'online' : 'offline'
  );
  const [useLocalStorage, setUseLocalStorage] = useState<boolean>(!isSupabaseConfigured);
  const [deskId, setDeskIdState] = useState<string>('Desk-01');
  const [settings, setSettingsState] = useState<PrintSettings>({ pageWidth: 90, pageHeight: 80 });
  
  // 로그인 상태 추가
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'desk' | null>(null);

  // 테스트 모드 (Test/Sandbox Mode) 상태 추가
  const [isTestMode, setIsTestModeState] = useState<boolean>(() => {
    return localStorage.getItem('mice_test_mode') === 'true';
  });

  const toggleTestMode = () => {
    setIsTestModeState(prev => {
      const next = !prev;
      localStorage.setItem('mice_test_mode', String(next));
      channel.postMessage({ type: 'SYNC_TEST_MODE', isTestMode: next });
      return next;
    });
  };

  const channel = React.useMemo(() => new BroadcastChannel('mice_idcard_sync'), []);
  const isPollingRef = React.useRef(false);

  // Settings Load Utility
  const loadSettingsFromLocalStorage = () => {
    const savedSettings = localStorage.getItem('mice_print_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettingsState(parsed);
      document.documentElement.style.setProperty('--page-width', `${parsed.pageWidth}mm`);
      document.documentElement.style.setProperty('--page-height', `${parsed.pageHeight}mm`);
    } else {
      setSettingsState({ pageWidth: 90, pageHeight: 80 });
      document.documentElement.style.setProperty('--page-width', '90mm');
      document.documentElement.style.setProperty('--page-height', '80mm');
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

  // Offline queue helper
  const queueUnsyncedItem = (
    type: 'attendee' | 'attendee_update' | 'print_log' | 'pre_qna' | 'pre_survey' | 'qna_review_update',
    data: any
  ) => {
    const saved = localStorage.getItem('mice_unsynced_items');
    const items = saved ? JSON.parse(saved) : [];
    items.push({ type, data, timestamp: new Date().toISOString() });
    localStorage.setItem('mice_unsynced_items', JSON.stringify(items));
    console.log(`[Offline Queue] Added unsynced ${type}:`, data);
  };

  // Offline queue synchronization helper
  const syncUnsyncedItems = async () => {
    if (!isSupabaseConfigured || useLocalStorage) return;
    const saved = localStorage.getItem('mice_unsynced_items');
    if (!saved) return;

    const items = JSON.parse(saved);
    if (items.length === 0) return;

    console.log(`[Sync] Attempting to sync ${items.length} pending offline items to Supabase...`);
    const remaining: any[] = [];

    for (const item of items) {
      try {
        let error = null;
        if (item.type === 'attendee') {
          const res = await supabase.from('attendees').insert(mapAttendeeToDb(item.data));
          error = res.error;
        } else if (item.type === 'attendee_update') {
          const res = await supabase.from('attendees').update(mapAttendeeToDb(item.data)).eq('id', item.data.id);
          error = res.error;
        } else if (item.type === 'print_log') {
          const res = await supabase.from('print_logs').insert(mapPrintLogToDb(item.data));
          error = res.error;
        } else if (item.type === 'pre_qna') {
          const res = await supabase.from('pre_qnas').insert(mapPreQnaToDb(item.data));
          error = res.error;
        } else if (item.type === 'pre_survey') {
          const res = await supabase.from('pre_surveys').insert(mapPreSurveyToDb(item.data));
          error = res.error;
        } else if (item.type === 'qna_review_update') {
          const res = await supabase.from('pre_qnas').update({ is_reviewed: item.data.isReviewed }).eq('id', item.data.id);
          error = res.error;
        }

        if (error) {
          console.error(`[Sync] Failed to sync ${item.type}:`, error);
          remaining.push(item);
        } else {
          console.log(`[Sync] Successfully synced ${item.type}:`, item.data.id || item.data.code || '');
        }
      } catch (e) {
        console.error(`[Sync] Connection error during sync for ${item.type}:`, e);
        remaining.push(item);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem('mice_unsynced_items', JSON.stringify(remaining));
    } else {
      localStorage.removeItem('mice_unsynced_items');
      console.log('[Sync] All offline data synced successfully.');
    }
  };

  // Fetch all data from Supabase (with dynamic timeout)
  const fetchAllData = async (isInitial: boolean = false) => {
    setDbError(null);
    if (isSupabaseConfigured && !useLocalStorage) {
      setDbStatus(prev => prev === 'offline' ? 'reconnecting' : prev);
    }

    const isPublicView = window.location.search.includes('view=public-register') || window.location.search.includes('view=portal');
    const searchParams = new URLSearchParams(window.location.search);
    const codeParam = searchParams.get('code');

    // ⚡ [0초 쾌속 로딩 패턴] 로컬 저장소 및 기본 데이터셋에서 즉시 선조회 (Stale-While-Revalidate)
    const savedAttendeesStr = localStorage.getItem('mice_attendees');
    let localList: Attendee[] = [];
    try {
      localList = savedAttendeesStr ? JSON.parse(savedAttendeesStr) : INITIAL_ATTENDEES;
    } catch(e) {
      localList = INITIAL_ATTENDEES;
    }

    if (codeParam) {
      const localFound = localList.find(a => a.code === codeParam);
      if (localFound) {
        setAttendees([localFound]);
        setIsLoading(false); // 로컬 캐시 발견 즉시 스피너 해제 (0초 응답)
      } else {
        setIsLoading(true);
      }
    } else {
      if (isPublicView) {
        setIsLoading(false);
      } else {
        if (localList.length > 0 && attendees.length === 0) {
          setAttendees(localList);
        }
        setIsLoading(true);
      }
    }

    const timeoutMs = isInitial ? 4000 : 2500;

    try {
      if (isPublicView) {
        if (codeParam) {
          let { data, error } = await withTimeout(
            supabase
              .from('attendees')
              .select('*')
              .eq('code', codeParam)
              .maybeSingle(),
            1500 // 1.5초 쾌속 타임아웃
          ).catch(e => ({ error: e, data: null }));

          if (!error && data) {
            setAttendees([mapDbToAttendee(data)]);
            setDbStatus('online');
            setIsLoading(false);
          } else {
            const localFound = localList.find(a => a.code === codeParam);
            if (localFound) {
              setAttendees([localFound]);
              setDbStatus('offline');
              setIsLoading(false);
            } else {
              setAttendees([]);
              setDbError('등록 정보를 찾을 수 없습니다.');
              setIsLoading(false);
            }
          }
        } else {
          const { data, error } = await withTimeout(
            supabase
              .from('attendees')
              .select('code')
              .order('code', { ascending: false })
              .limit(1),
            1500
          ).catch(e => ({ error: e, data: null }));

          if (!error && data && data.length > 0) {
            setAttendees([{
              id: '', code: data[0].code, type: '', organization: '',
              position: '', name: '', isAttended: false,
              registeredType: '사전', printedCount: 0,
            }]);
            setDbStatus('online');
          }
          setIsLoading(false);
        }
        setPrintLogs([]);
      } else {
        const [attResult, logResult, qnaResult, surveyResult] = await Promise.all([
          withTimeout(
            supabase
              .from('attendees')
              .select('*')
              .order('created_at', { ascending: false }),
            timeoutMs
          ).catch(err => ({ error: err, data: null })),
          withTimeout(
            supabase
              .from('print_logs')
              .select('*')
              .order('printed_at', { ascending: false }),
            timeoutMs
          ).catch(err => ({ error: err, data: null })),
          withTimeout(
            supabase
              .from('pre_qnas')
              .select('*')
              .order('created_at', { ascending: false }),
            timeoutMs
          ).catch(err => ({ error: err, data: null })),
          withTimeout(
            supabase
              .from('pre_surveys')
              .select('*')
              .order('created_at', { ascending: false }),
            timeoutMs
          ).catch(err => ({ error: err, data: null }))
        ]);

        type FetchResult = { data: Record<string, unknown>[] | null; error: unknown };
        const { data: attData, error: attError } = attResult as FetchResult;
        const { data: logData, error: logError } = logResult as FetchResult;
        const { data: qnaData, error: qnaError } = qnaResult as FetchResult;
        const { data: surveyData, error: surveyError } = surveyResult as FetchResult;

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
        setDbStatus('online');
        setUseLocalStorage(false);
        syncUnsyncedItems();
      }
    } catch (err: any) {
      console.error('Supabase 데이터 로드 실패. 로컬 저장소 모드로 대체합니다:', err);
      setUseLocalStorage(true);
      setDbStatus('offline');
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

  // Background polling without blocking UI loading spinner
  const fetchPollingData = async () => {
    if (useLocalStorage || !isSupabaseConfigured) return;
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      const [attResult, logResult, qnaResult, surveyResult] = await Promise.all([
        withTimeout(
          supabase
            .from('attendees')
            .select('*')
            .order('created_at', { ascending: false }),
          5000
        ).catch(() => ({ error: true, data: null })),
        withTimeout(
          supabase
            .from('print_logs')
            .select('*')
            .order('printed_at', { ascending: false }),
          5000
        ).catch(() => ({ error: true, data: null })),
        withTimeout(
          supabase
            .from('pre_qnas')
            .select('*')
            .order('created_at', { ascending: false }),
          5000
        ).catch(() => ({ error: true, data: null })),
        withTimeout(
          supabase
            .from('pre_surveys')
            .select('*')
            .order('created_at', { ascending: false }),
          5000
        ).catch(() => ({ error: true, data: null }))
      ]);

      const attData = attResult.data;
      const logData = logResult.data;
      const qnaData = qnaResult.data;
      const surveyData = surveyResult.data;

      if (attData) setAttendees(attData.map(mapDbToAttendee));
      if (logData) setPrintLogs(logData.map(mapDbToPrintLog));
      if (qnaData) setPreQnas(qnaData.map(mapDbToPreQna));
      if (surveyData) setPreSurveys(surveyData.map(mapDbToPreSurvey));
      
      setDbStatus('online');
      syncUnsyncedItems();
    } catch (e) {
      console.warn('백그라운드 폴링 실패:', e);
    } finally {
      isPollingRef.current = false;
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
      if (typeof event.data === 'object' && event.data?.type === 'SYNC_TEST_MODE') {
        setIsTestModeState(event.data.isTestMode);
      }
    };

    channel.addEventListener('message', handleSyncMessage);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mice_print_settings') {
        loadSettingsFromLocalStorage();
      }
      if (e.key === 'mice_test_mode') {
        setIsTestModeState(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleSyncMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [channel]);

  // Hybrid Sync Listener (BroadcastChannel + LocalStorage)
  useEffect(() => {
    if (useLocalStorage) {
      loadFromLocalStorageFallback();
    }

    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data === 'SYNC_DATA') {
        if (useLocalStorage) {
          loadFromLocalStorageFallback();
        } else {
          fetchPollingData();
        }
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
        // Supabase 모드에서는 BroadcastChannel이 동기화를 담당하므로 storage 이벤트 무시
        if (useLocalStorage) {
          loadFromLocalStorageFallback();
        }
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

    // Initial load with 12s timeout for cold start
    fetchAllData(true);

    const isPublicView = 
      window.location.search.includes('view=public-register') || 
      window.location.search.includes('view=portal');
    if (isPublicView) {
      console.log('모바일 화면 접속: Supabase Realtime 웹소켓 구독을 생략합니다.');
      return;
    }

    console.log('관리자/데스크 화면 접속: Supabase Realtime 웹소켓 구독을 시작합니다.');

    let isFirstSubscription = true;
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
      .subscribe((status: string) => {
        // 재연결 시 끊긴 동안 누락된 이벤트를 따라잡기 위해 즉시 폴링
        if (status === 'SUBSCRIBED') {
          if (!isFirstSubscription) {
            console.log('Realtime 재연결: 누락 이벤트 동기화 시작');
            fetchPollingData();
          }
          isFirstSubscription = false;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('Realtime 구독 오류:', status);
          fetchPollingData();
        }
      });

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, []);

  // Effect: Auto-reconnect background timer if using fallback local storage
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let reconnectTimer: any = null;

    if (useLocalStorage) {
      console.log('DB 연결 유실: 백그라운드 재연결을 대기합니다.');
      reconnectTimer = setInterval(async () => {
        try {
          const { error } = await supabase.from('attendees').select('id').limit(1);
          if (!error) {
            console.log('DB 재연결 성공! 연동 모드로 전환합니다.');
            setUseLocalStorage(false);
            setDbStatus('online');
            setDbError(null);
            fetchAllData(false);
          } else {
            setDbStatus('offline');
          }
        } catch (e) {
          setDbStatus('offline');
        }
      }, 15000); // Check connection every 15s
    }

    return () => {
      if (reconnectTimer) clearInterval(reconnectTimer);
    };
  }, [useLocalStorage]);

  // Effect: Listen to browser network changes to trigger reconnect immediately
  useEffect(() => {
    const handleOnline = () => {
      console.log('네트워크가 온라인으로 감지되었습니다. DB 재연결을 시도합니다.');
      if (isSupabaseConfigured) {
        supabase.from('attendees').select('id').limit(1).then(({ error }: any) => {
          if (!error) {
            setUseLocalStorage(false);
            setDbStatus('online');
            setDbError(null);
            fetchAllData(false);
          }
        });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Effect: Visibility change to refresh when user focuses tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSupabaseConfigured && !useLocalStorage) {
        console.log('화면 활성화: 최신 데이터를 실시간 갱신합니다.');
        fetchPollingData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [useLocalStorage]);

  // Effect: Automatic polling fallback (every 10 seconds) for admin screens if Realtime subscription is slow
  useEffect(() => {
    if (!isSupabaseConfigured || useLocalStorage) return;

    const isPublicView = 
      window.location.search.includes('view=public-register') || 
      window.location.search.includes('view=portal');
    if (isPublicView) return;

    const pollingInterval = setInterval(() => {
      console.log('실시간 데이터 폴백: 백그라운드 데이터 수정을 확인합니다.');
      fetchPollingData();
    }, 10000); // 10 seconds

    return () => clearInterval(pollingInterval);
  }, [useLocalStorage]);

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
            queueUnsyncedItem(index === 0 ? 'attendee' : 'print_log', index === 0 ? created : newLog);
          }
        });
      }).catch((err) => {
        console.error('Supabase addAttendee Promise 실패:', err);
        queueUnsyncedItem('attendee', created);
        if (newLog) queueUnsyncedItem('print_log', newLog);
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
      channel.postMessage('SYNC_DATA');
    } else {
      const updatedAttendees = [created, ...attendees];
      const updatedLogs = newLog ? [newLog, ...printLogs] : printLogs;
      saveAndBroadcast(updatedAttendees, updatedLogs);
      queueUnsyncedItem('attendee', created);
      if (newLog) queueUnsyncedItem('print_log', newLog);
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
            imported.forEach(att => queueUnsyncedItem('attendee', att));
          }
        });
      setAttendees(prev => [...prev, ...imported]);
      channel.postMessage('SYNC_DATA');
    } else {
      const updated = [...attendees, ...imported];
      saveAndBroadcast(updated, printLogs);
      imported.forEach(att => queueUnsyncedItem('attendee', att));
    }
  };

  const printAttendee = (id: string) => {
    const target = attendees.find(a => a.id === id);
    if (!target) return;

    if (isTestMode) {
      console.log(`[🧪 Test Mode] 명찰 발급 테스트 실행 (대상: ${target.name}) - DB 및 참석 통계 미반영`);
      return;
    }

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
        if (attRes.error) {
          console.error('Supabase print update error:', attRes.error);
          queueUnsyncedItem('attendee_update', updatedAttendee);
        }
        if (logRes.error) {
          console.error('Supabase print log insert error:', logRes.error);
          queueUnsyncedItem('print_log', newLog);
        }
      });

      setAttendees(prev => prev.map(a => a.id === id ? updatedAttendee : a));
      setPrintLogs(prev => {
        if (prev.some(l => l.id === newLog.id)) return prev;
        return [newLog, ...prev];
      });
      channel.postMessage('SYNC_DATA');
    } else {
      const updatedAttendees = attendees.map(att => att.id === id ? updatedAttendee : att);
      const updatedLogs = [newLog, ...printLogs];
      saveAndBroadcast(updatedAttendees, updatedLogs);
      queueUnsyncedItem('attendee_update', updatedAttendee);
      queueUnsyncedItem('print_log', newLog);
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
      }).catch((err) => {
        console.error('Supabase clearAllData Promise 실패:', err);
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
      }).catch((err) => {
        console.error('Supabase generateDummyData Promise 실패:', err);
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
          if (error) {
            console.error('Supabase addPreQna error:', error);
            queueUnsyncedItem('pre_qna', created);
          }
        });
      setPreQnas((prev) => [created, ...prev]);
      channel.postMessage('SYNC_DATA');
    } else {
      const updated = [created, ...preQnas];
      localStorage.setItem('mice_pre_qnas', JSON.stringify(updated));
      setPreQnas(updated);
      queueUnsyncedItem('pre_qna', created);
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
          if (error) {
            console.error('Supabase addPreSurvey error:', error);
            queueUnsyncedItem('pre_survey', created);
          }
        });
      setPreSurveys((prev) => [created, ...prev]);
      channel.postMessage('SYNC_DATA');
    } else {
      const updated = [created, ...preSurveys];
      localStorage.setItem('mice_pre_surveys', JSON.stringify(updated));
      setPreSurveys(updated);
      queueUnsyncedItem('pre_survey', created);
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
          if (error) {
            console.error('Supabase update preQna error:', error);
            queueUnsyncedItem('qna_review_update', { id, isReviewed: updatedQna.isReviewed });
          }
        });
      setPreQnas((prev) => prev.map((q) => (q.id === id ? updatedQna : q)));
      channel.postMessage('SYNC_DATA');
    } else {
      const updated = preQnas.map((q) => (q.id === id ? updatedQna : q));
      localStorage.setItem('mice_pre_qnas', JSON.stringify(updated));
      setPreQnas(updated);
      queueUnsyncedItem('qna_review_update', { id, isReviewed: updatedQna.isReviewed });
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
      dbStatus,
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
      isTestMode,
      toggleTestMode,
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
