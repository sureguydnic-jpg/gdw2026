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
import type { Attendee } from './types';
import { LayoutDashboard, QrCode, UserPlus, MessageSquare, Database, Sparkles, Settings, LogOut } from 'lucide-react';
import './App.css';

const MainApp: React.FC = () => {
  const { deskId, userRole, logout } = useAttendees();
  
  // 일반 데스크 로그인 시 기본 탭을 스캐너로 지정
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'register' | 'sms' | 'list' | 'settings'>('scanner');

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
            <span style={logoSubText}>고양 데스티네이션 위크 명찰 인쇄 시스템</span>
          </div>
        </div>
        
        {/* 데스크 ID 라이브 뱃지 & 로그아웃 버튼 */}
        <div style={headerMeta}>
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
  const isPublicRegister = searchParams.get('view') === 'public-register';

  return (
    <AttendeeProvider>
      <AppContent isPublicRegister={isPublicRegister} />
    </AttendeeProvider>
  );
};

const AppContent: React.FC<{ isPublicRegister: boolean }> = ({ isPublicRegister }) => {
  const { isLoggedIn } = useAttendees();

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
