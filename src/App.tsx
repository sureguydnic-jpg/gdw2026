import React, { useState } from 'react';
import { AttendeeProvider, useAttendees } from './context/AttendeeContext';
import { Dashboard } from './components/Dashboard';
import { AttendeeList } from './components/AttendeeList';
import { SmsSimulator } from './components/SmsSimulator';
import { OnsiteScanner } from './components/OnsiteScanner';
import { OnsiteRegister } from './components/OnsiteRegister';
import { IdCardTemplate } from './components/IdCardTemplate';
import { SettingsPanel } from './components/SettingsPanel';
import { PublicRegister } from './components/PublicRegister';
import { LoginGate } from './components/LoginGate';
import { MobilePortal } from './components/MobilePortal';
import { PortalAdmin } from './components/PortalAdmin';
import type { Attendee } from './types';
import { LayoutDashboard, QrCode, UserPlus, MessageSquare, Database, Sparkles, Settings, LogOut, ClipboardList, FlaskConical, Printer, ChevronDown } from 'lucide-react';
import './App.css';

const MainApp: React.FC = () => {
  const { deskId, userRole, logout, dbStatus, isTestMode, toggleTestMode, addAttendee } = useAttendees();
  
  // 일반 데스크 로그인 시 기본 탭을 스캐너로 지정
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'register' | 'sms' | 'list' | 'settings' | 'portal-admin'>('scanner');
  const [isQuickDropdownOpen, setIsQuickDropdownOpen] = useState(false);

  // 권한에 따른 탭 Fallback 처리
  React.useEffect(() => {
    if (userRole === 'admin') {
      setActiveTab('dashboard'); // 관리자는 대시보드 우선
    } else {
      setActiveTab('scanner');   // 데스크 요원은 스캐너 우선
    }
  }, [userRole]);

  const [printAttendeeData, setPrintAttendeeData] = useState<Attendee | null>(null);

  // 1. 브라우저 실제 인쇄 트리거 공통 함수
  const triggerPrint = (attendee: Attendee) => {
    // 인쇄용 데이터 주입
    setPrintAttendeeData(attendee);

    // React가 DOM에 명찰 요소를 정상 렌더링할 시간을 확보 (대기 시간 확보)
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // 2. 무기명 1클릭 퀵 명찰 인쇄 함수 (STAFF, PRESS, GUEST, VIP)
  const handleQuickPrint = (roleType: string) => {
    setIsQuickDropdownOpen(false);

    const roleNameKrMap: Record<string, string> = {
      'PCO': '운영 대행사 P.C.O',
      'STAFF': '운영요원',
      'PRESS': '취재기자',
      'GUEST': '초청게스트',
      'VIP': '귀빈 VIP'
    };

    const quickAttendee: Attendee = {
      id: `quick-${Date.now()}`,
      code: `QUICK-${Math.floor(100 + Math.random() * 900)}`,
      type: roleType,
      nationality: 'Domestic',
      name: roleType,
      nameEn: roleType,
      nameKr: roleNameKrMap[roleType] || roleType,
      organization: 'Goyang Destination Week 2026',
      organizationEn: 'Goyang Destination Week 2026',
      organizationKr: '고양 데스티네이션 위크 2026',
      position: 'OFFICIAL PASS',
      positionEn: 'OFFICIAL PASS',
      positionKr: '공식 입장 패스',
      isAttended: true,
      registeredType: '현장',
      printedCount: 1,
    };

    triggerPrint(quickAttendee);

    // 테스트 모드가 아닐 때만 현장 등록 DB에 기록
    if (!isTestMode) {
      addAttendee({
        type: roleType,
        nationality: 'Domestic',
        name: roleType,
        nameEn: roleType,
        nameKr: roleNameKrMap[roleType] || roleType,
        organization: 'Goyang Destination Week 2026',
        organizationEn: 'Goyang Destination Week 2026',
        organizationKr: '고양 데스티네이션 위크 2026',
        position: 'OFFICIAL PASS',
        positionEn: 'OFFICIAL PASS',
        positionKr: '공식 입장 패스',
        registeredType: '현장',
        isAttended: true,
        printedCount: 1,
        printedBy: deskId
      });
    }
  };

  // 인쇄 대화 상자가 완전히 닫힌 후에 데이터를 초기화 (크롬 비동기 인쇄 백지화 방지)
  React.useEffect(() => {
    const handleAfterPrint = () => {
      setPrintAttendeeData(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return (
    <div style={appWrapperStyle}>
      {/* 글로벌 네비게이션 헤더 */}
      <header className="glass" style={headerStyle}>
        <div style={logoWrapper}>
          <Sparkles size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <span style={logoMainText}>GOYANG DESTINATION WEEK 2026</span>
            <span style={logoSubText}>Smart Hub (명찰 및 현장 입장 관리)</span>
          </div>
        </div>
        
        {/* 퀵 발급 드롭다운, 테스트 모드 토글, DB 상태 뱃지 & 로그아웃 버튼 */}
        <div style={headerMeta}>
          {/* 무기명 퀵 발급 드롭다운 단일 버튼 */}
          <div style={{ position: 'relative' }}>
            <button 
              style={btnQuickDropdownStyle}
              onClick={() => setIsQuickDropdownOpen(prev => !prev)}
              title="무기명 명찰 (STAFF, PRESS, GUEST, VIP) 1클릭 즉석 인쇄"
            >
              <Printer size={14} style={{ marginRight: '5px' }} />
              퀵 발급
              <ChevronDown size={14} style={{ marginLeft: '4px', transform: isQuickDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            
            {isQuickDropdownOpen && (
              <div style={quickDropdownMenuStyle}>
                <button style={quickMenuItemStyle} onClick={() => handleQuickPrint('PCO')}>
                  <span>🏢 <strong>PCO</strong> (대행사)</span>
                  <span style={quickItemBadgeStyle}>즉석 발급</span>
                </button>
                <button style={quickMenuItemStyle} onClick={() => handleQuickPrint('STAFF')}>
                  <span>👷 <strong>STAFF</strong></span>
                  <span style={quickItemBadgeStyle}>즉석 발급</span>
                </button>
                <button style={quickMenuItemStyle} onClick={() => handleQuickPrint('PRESS')}>
                  <span>📰 <strong>PRESS</strong></span>
                  <span style={quickItemBadgeStyle}>즉석 발급</span>
                </button>
                <button style={quickMenuItemStyle} onClick={() => handleQuickPrint('GUEST')}>
                  <span>🎟️ <strong>GUEST</strong></span>
                  <span style={quickItemBadgeStyle}>즉석 발급</span>
                </button>
                <button style={quickMenuItemStyle} onClick={() => handleQuickPrint('VIP')}>
                  <span>⭐ <strong>VIP</strong></span>
                  <span style={quickItemBadgeStyle}>즉석 발급</span>
                </button>
              </div>
            )}
          </div>

          <button 
            style={testToggleBtnStyle(isTestMode)} 
            onClick={toggleTestMode} 
            title="테스트 모드 (ON 상태에서는 명찰 인쇄 테스트 가능하며 실제 통계 카운팅은 제외됩니다)"
          >
            <FlaskConical size={14} style={{ marginRight: '5px' }} />
            테스트 모드 {isTestMode ? 'ON' : 'OFF'}
          </button>

          <div style={{
            ...dbStatusBadgeStyle,
            backgroundColor: dbStatus === 'online' ? 'rgba(16, 185, 129, 0.1)' : dbStatus === 'reconnecting' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: dbStatus === 'online' ? 'rgba(16, 185, 129, 0.2)' : dbStatus === 'reconnecting' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: dbStatus === 'online' ? '#34d399' : dbStatus === 'reconnecting' ? '#fbbf24' : '#f87171'
          }}>
            <span style={{
              ...activeDot,
              backgroundColor: dbStatus === 'online' ? '#10b981' : dbStatus === 'reconnecting' ? '#f59e0b' : '#ef4444'
            }} />
            {dbStatus === 'online' ? 'DB 연결됨' : dbStatus === 'reconnecting' ? 'DB 재연결 중...' : '로컬 모드 (오프라인)'}
          </div>

          <div style={deskBadgeStyle}>
            <span style={activeDot} />
            {userRole === 'admin' ? '마스터 관리자' : `${deskId} 요원`} 로그인 중
          </div>
          <button style={btnLogoutStyle} onClick={logout} title="시스템 로그아웃">
            <LogOut size={14} style={{ marginRight: '4px' }} />
            로그아웃
          </button>
        </div>
      </header>

      {/* 테스트 모드 활성화 시 표시되는 안내 배너 */}
      {isTestMode && (
        <div style={testBannerStyle}>
          <FlaskConical size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
          <span>
            <strong>🧪 테스트 모드 (Sandbox Mode) 동작 중:</strong> 장비 및 인쇄 테스트가 가능하며, 실제 참가자 출석 횟수 및 DB 통계에는 반영되지 않습니다.
          </span>
        </div>
      )}

      {/* 탭 네비게이션 메뉴 */}
      <div style={navigationContainer}>
        <nav style={navStyle}>
          {userRole === 'admin' && (
            <button 
              style={activeTab === 'dashboard' ? activeTabBtnStyle : tabBtnStyle} 
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={16} />
              통합 대시보드
            </button>
          )}
          <button 
            style={activeTab === 'scanner' ? activeTabBtnStyle : tabBtnStyle} 
            onClick={() => setActiveTab('scanner')}
          >
            <QrCode size={16} />
            현장 QR 스캔 데스크
          </button>
          <button 
            style={activeTab === 'register' ? activeTabBtnStyle : tabBtnStyle} 
            onClick={() => setActiveTab('register')}
          >
            <UserPlus size={16} />
            현장 즉석 등록
          </button>
          <button 
            style={activeTab === 'sms' ? activeTabBtnStyle : tabBtnStyle} 
            onClick={() => setActiveTab('sms')}
          >
            <MessageSquare size={16} />
            안내 문자 발송기
          </button>
          <button 
            style={activeTab === 'list' ? activeTabBtnStyle : tabBtnStyle} 
            onClick={() => setActiveTab('list')}
          >
            <Database size={16} />
            참가자 데이터 관리
          </button>
          {userRole === 'admin' && (
            <button 
              style={activeTab === 'settings' ? activeTabBtnStyle : tabBtnStyle} 
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={16} />
              설정 및 기기세팅
            </button>
          )}
          {userRole === 'admin' && (
            <button 
              style={activeTab === 'portal-admin' ? activeTabBtnStyle : tabBtnStyle} 
              onClick={() => setActiveTab('portal-admin')}
            >
              <ClipboardList size={16} />
              사전 질문/설문 관리
            </button>
          )}
        </nav>
      </div>

      {/* 메인 뷰포트 컨테이너 (데이터 관리 페이지만 와이드하게 처리) */}
      <main 
        className={activeTab === 'list' ? '' : 'container'} 
        style={{
          ...mainContentStyle,
          maxWidth: activeTab === 'list' ? '98%' : '1400px',
          margin: '0 auto',
          padding: activeTab === 'list' ? '2rem 1rem' : '2rem'
        }}
      >
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'scanner' && <OnsiteScanner onPrintTrigger={triggerPrint} />}
        {activeTab === 'register' && <OnsiteRegister onPrintTrigger={triggerPrint} />}
        {activeTab === 'sms' && <SmsSimulator />}
        {activeTab === 'list' && <AttendeeList onPrintTrigger={triggerPrint} />}
        {activeTab === 'settings' && <SettingsPanel />}
        {activeTab === 'portal-admin' && <PortalAdmin />}
      </main>

      {/* 실제 인쇄 시에만 활성화되어 인쇄 드라이버로 보내지는 숨김 레이아웃 */}
      <div id="print-area">
        {printAttendeeData && <IdCardTemplate attendee={printAttendeeData} />}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const view = searchParams.get('view');
  const isPublicRegister = view === 'public-register';
  const isPortal = view === 'portal';

  return (
    <AttendeeProvider>
      <AppContent isPublicRegister={isPublicRegister} isPortal={isPortal} />
    </AttendeeProvider>
  );
};

const AppContent: React.FC<{ isPublicRegister: boolean; isPortal: boolean }> = ({ isPublicRegister, isPortal }) => {
  const { isLoggedIn } = useAttendees();

  if (isPortal) {
    return <MobilePortal />;
  }

  if (isPublicRegister) {
    return <PublicRegister />;
  }

  return isLoggedIn ? <MainApp /> : <LoginGate />;
};

export default App;

/* ==========================================
   CSS IN JS (App.tsx UI)
   ========================================== */
const appWrapperStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--bg-primary)',
};

const headerStyle: React.CSSProperties = {
  height: '70px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 2rem',
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: '0',
  zIndex: 100,
};

const logoWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const logoMainText: React.CSSProperties = {
  fontFamily: 'var(--font-title)',
  fontWeight: '800',
  fontSize: '1rem',
  letterSpacing: '1px',
  color: 'var(--text-primary)',
  display: 'block',
};

const logoSubText: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'var(--text-secondary)',
  display: 'block',
};

const headerMeta: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const deskBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  padding: '0.35rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--accent)',
};

const activeDot: React.CSSProperties = {
  width: '6px',
  height: '6px',
  backgroundColor: 'var(--accent)',
  borderRadius: '50%',
  display: 'inline-block',
};

const navigationContainer: React.CSSProperties = {
  backgroundColor: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
  padding: '0 2rem',
  overflowX: 'auto',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  maxWidth: '1400px',
  margin: '0 auto',
  gap: '1rem',
};

const baseTabBtn: React.CSSProperties = {
  padding: '1.2rem 1rem',
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  backgroundColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '3px solid transparent',
  whiteSpace: 'nowrap',
};

const tabBtnStyle: React.CSSProperties = {
  ...baseTabBtn,
};

const activeTabBtnStyle: React.CSSProperties = {
  ...baseTabBtn,
  color: 'var(--accent)',
  borderBottom: '3px solid var(--accent)',
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  padding: '2rem',
};

const btnLogoutStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.15)',
  color: '#f87171',
  padding: '0.35rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const dbStatusBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  border: '1px solid transparent',
  padding: '0.35rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: '600',
  transition: 'all 0.2s ease',
};

const testBannerStyle: React.CSSProperties = {
  backgroundColor: 'rgba(245, 158, 11, 0.15)',
  borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
  color: '#fbbf24',
  padding: '0.65rem 1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.85rem',
  fontWeight: '600',
};

const testToggleBtnStyle = (isTest: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: isTest ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${isTest ? '#f59e0b' : 'var(--border)'}`,
  color: isTest ? '#fbbf24' : 'var(--text-secondary)',
  padding: '0.35rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

const btnQuickDropdownStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  color: '#60a5fa',
  padding: '0.35rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const quickDropdownMenuStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  backgroundColor: '#111827',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '200px',
  zIndex: 9999,
  overflow: 'hidden',
  padding: '0.4rem',
  gap: '0.25rem',
};

const quickMenuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.55rem 0.8rem',
  fontSize: '0.82rem',
  color: 'var(--text-primary)',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.2s ease',
};

const quickItemBadgeStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '600',
  color: '#60a5fa',
  backgroundColor: 'rgba(59, 130, 246, 0.12)',
  padding: '0.15rem 0.4rem',
  borderRadius: '4px',
  marginLeft: '0.5rem',
  whiteSpace: 'nowrap',
};
