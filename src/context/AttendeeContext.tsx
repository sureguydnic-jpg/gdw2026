import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Attendee, PrintLog, PrintSettings } from '../types';

interface AttendeeContextType {
  attendees: Attendee[];
  printLogs: PrintLog[];
  deskId: string;
  setDeskId: (id: string) => void;
  isLoggedIn: boolean;
  userRole: 'admin' | 'desk' | null;
  login: (password: string) => boolean;
  logout: () => void;
  settings: PrintSettings;
  updateSettings: (newSettings: PrintSettings) => void;
  addAttendee: (attendee: Omit<Attendee, 'id' | 'code' | 'isAttended' | 'printedCount' | 'registeredType'> & { registeredType?: '사전' | '현장' }) => Attendee;
  importAttendees: (newAttendees: Omit<Attendee, 'id' | 'isAttended' | 'printedCount' | 'registeredType'>[]) => void;
  printAttendee: (id: string) => void;
  clearAllData: () => void;
  generateDummyData: () => void;
}

const AttendeeContext = createContext<AttendeeContextType | undefined>(undefined);

const INITIAL_ATTENDEES: Attendee[] = [
  {
    id: 'att-1',
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
    id: 'att-2',
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
    id: 'att-3',
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
    id: 'att-4',
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
    id: 'att-5',
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
    id: 'att-6',
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
    id: 'att-7',
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
    id: 'att-8',
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
    id: 'att-9',
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
    id: 'att-10',
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

export const AttendeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [printLogs, setPrintLogs] = useState<PrintLog[]>([]);
  const [deskId, setDeskIdState] = useState<string>('Desk-01');
  const [settings, setSettingsState] = useState<PrintSettings>({ pageWidth: 80, pageHeight: 50 });
  
  // 로그인 상태 추가
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'desk' | null>(null);

  const channel = React.useMemo(() => new BroadcastChannel('mice_idcard_sync'), []);

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
    
    channel.postMessage('SYNC_DATA');
  };

  const loadFromLocalStorage = () => {
    const savedAttendees = localStorage.getItem('mice_attendees');
    const savedLogs = localStorage.getItem('mice_print_logs');
    const savedSettings = localStorage.getItem('mice_print_settings');
    
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

  useEffect(() => {
    loadFromLocalStorage();

    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data === 'SYNC_DATA') {
        loadFromLocalStorage();
      }
    };

    channel.addEventListener('message', handleSyncMessage);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mice_attendees' || e.key === 'mice_print_logs') {
        loadFromLocalStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      channel.removeEventListener('message', handleSyncMessage);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [channel]);

  const saveAndBroadcast = (updatedAttendees: Attendee[], updatedLogs: PrintLog[]) => {
    localStorage.setItem('mice_attendees', JSON.stringify(updatedAttendees));
    localStorage.setItem('mice_print_logs', JSON.stringify(updatedLogs));
    setAttendees(updatedAttendees);
    setPrintLogs(updatedLogs);
    channel.postMessage('SYNC_DATA');
  };

  const addAttendee = (
    newAtt: Omit<Attendee, 'id' | 'code' | 'isAttended' | 'printedCount' | 'registeredType'> & { registeredType?: '사전' | '현장' }
  ) => {
    const codes = attendees.map(a => parseInt(a.code, 10)).filter(c => !isNaN(c));
    const nextCode = codes.length > 0 ? Math.max(...codes) + 1 : 10001;
    
    const created: Attendee = {
      ...newAtt,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: String(nextCode),
      isAttended: false,
      printedCount: 0,
      registeredType: newAtt.registeredType || '현장'
    };

    const updated = [created, ...attendees];
    saveAndBroadcast(updated, printLogs);
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
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        code: currentCode,
        isAttended: false,
        printedCount: 0,
        registeredType: '사전'
      };
    });

    const updated = [...attendees, ...imported];
    saveAndBroadcast(updated, printLogs);
  };

  const printAttendee = (id: string) => {
    const updatedAttendees = attendees.map(att => {
      if (att.id === id) {
        return {
          ...att,
          isAttended: true,
          attendedAt: att.attendedAt || new Date().toISOString(),
          printedCount: att.printedCount + 1,
          printedBy: deskId
        };
      }
      return att;
    });

    const target = attendees.find(a => a.id === id);
    if (!target) return;

    const newLog: PrintLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      attendeeId: target.id,
      name: target.name,
      organization: target.organization,
      type: target.type,
      printedAt: new Date().toISOString(),
      deskId: deskId,
      registeredType: target.registeredType
    };

    const updatedLogs = [newLog, ...printLogs];
    saveAndBroadcast(updatedAttendees, updatedLogs);
  };

  const clearAllData = () => {
    localStorage.removeItem('mice_attendees');
    localStorage.removeItem('mice_print_logs');
    setAttendees([]);
    setPrintLogs([]);
    channel.postMessage('SYNC_DATA');
  };

  const generateDummyData = () => {
    localStorage.setItem('mice_attendees', JSON.stringify(INITIAL_ATTENDEES));
    localStorage.setItem('mice_print_logs', JSON.stringify([]));
    setAttendees(INITIAL_ATTENDEES);
    setPrintLogs([]);
    channel.postMessage('SYNC_DATA');
  };

  return (
    <AttendeeContext.Provider value={{
      attendees,
      printLogs,
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
      generateDummyData
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
