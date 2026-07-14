import React, { useState, useEffect, useRef } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import type { Attendee } from '../types';
import { QrCode, Printer, AlertTriangle, CheckCircle2, Volume2, ShieldAlert } from 'lucide-react';

interface OnsiteScannerProps {
  onPrintTrigger: (attendee: Attendee) => void;
}

export const OnsiteScanner: React.FC<OnsiteScannerProps> = ({ onPrintTrigger }) => {
  const { attendees, deskId, setDeskId, printAttendee } = useAttendees();
  
  const [scanInput, setScanInput] = useState('');
  const [scannedAttendee, setScannedAttendee] = useState<Attendee | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error' | 'printing'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // 전역 키보드 버퍼 (하드웨어 스캐너 입력용)
  const keyBuffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  // 브라우저 자체 오디오 신디사이저로 사운드 이펙트 생성 (성공/오류 비프음)
  const playSound = (type: 'success' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        // 성공 비프음 (청아하고 짧은 두 번의 음)
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
          gain2.gain.setValueAtTime(0.1, ctx.currentTime);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.15);
        }, 100);
      } else {
        // 에러 비프음 (낮고 둔한 경고음)
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('Audio Context is blocked by browser autoplay policy.');
    }
  };

  // 1. 전역 키보드 리스너 등록 (스캐너 연동)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 인풋 요소에 포커스가 있는 상태에서 타이핑 중이면 전역 후킹을 하지 않음 (중복 입력 방지)
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'SELECT')) {
        // 단, 포커스된 인풋이 스캔용 텍스트 필드이고 엔터 키가 눌린 경우 아래의 스캔 트리거로 연결
        if (e.key === 'Enter' && activeEl.id === 'manual-scan-input') {
          handleScan(scanInput);
        }
        return;
      }

      const currentTime = Date.now();
      
      // 스캐너의 고속 입력을 감지하기 위해 시간 차이 체크 (대략 문자 입력당 50ms 미만)
      // 사람이 타이핑하는 경우 버퍼가 지워질 수 있도록 처리
      if (currentTime - lastKeyTime.current > 150) {
        keyBuffer.current = '';
      }
      lastKeyTime.current = currentTime;

      // 엔터(Enter) 입력 시 스캔 완료로 간주
      if (e.key === 'Enter') {
        if (keyBuffer.current.trim()) {
          handleScan(keyBuffer.current.trim());
          keyBuffer.current = '';
        }
      } else if (e.key.length === 1 && /[0-9]/.test(e.key)) {
        // 숫자 등록코드만 버퍼에 추가
        keyBuffer.current += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [scanInput, attendees]);

  // 2. 스캔 로직 실행
  const handleScan = (code: string) => {
    if (!code) return;

    // 참가자 중 등록코드가 매칭되는 데이터 탐색
    const matched = attendees.find(a => a.code === code);
    
    if (matched) {
      playSound('success');
      setScannedAttendee(matched);
      setScanStatus('success');
      setScanInput('');

      // 1.5초 후에 명찰 인쇄 트리거 및 입장 처리
      setTimeout(() => {
        setScanStatus('printing');
        printAttendee(matched.id); // Context 상태 업데이트 및 로그 생성
        onPrintTrigger(matched);   // 실제 브라우저 인쇄 실행
        
        // 2초 뒤 상태 복귀
        setTimeout(() => {
          setScanStatus('idle');
          setScannedAttendee(null);
        }, 2000);
      }, 1500);
    } else {
      playSound('error');
      setErrorMessage(`등록코드 [${code}]에 해당하는 사전참가자를 찾을 수 없습니다. 다시 시도해 주세요.`);
      setScanStatus('error');
      setScanInput('');

      // 3초 뒤 에러 메시지 초기화
      setTimeout(() => {
        setScanStatus('idle');
      }, 3000);
    }
  };

  // 수동 스캔 시뮬레이션 버튼 클릭 핸들러
  const handleManualScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(scanInput);
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      {/* 상단 컨트롤 바 */}
      <div className="glass" style={scannerHeaderStyle}>
        <div style={headerTextWrapper}>
          <h2 style={titleStyle}>현장 QR코드 스캔 게이트</h2>
          <p style={subtitleStyle}>바코드 스캐너로 QR코드를 인식하면 해당 참가자 명찰이 자동 인쇄됩니다.</p>
        </div>
        
        {/* 데스크 ID 셀렉터 */}
        <div style={deskSelectorStyle}>
          <label style={deskLabelStyle}>현재 운영 데스크:</label>
          <select 
            value={deskId} 
            onChange={(e) => setDeskId(e.target.value)}
            style={selectStyle}
          >
            <option value="Desk-01">데스크 01 (Desk-01)</option>
            <option value="Desk-02">데스크 02 (Desk-02)</option>
            <option value="Desk-03">데스크 03 (Desk-03)</option>
            <option value="Desk-04">데스크 04 (Desk-04)</option>
          </select>
        </div>
      </div>

      <div style={scannerLayoutGrid}>
        {/* 메인 스캔 디스플레이 영역 */}
        <div className="glass" style={mainDisplayCard}>
          {scanStatus === 'idle' && (
            <div style={statusContainer}>
              <div className="glow" style={pulseScannerRing}>
                <QrCode size={64} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={statusTitle}>스캐너 인식 대기 중</h3>
              <p style={statusDesc}>
                바코드 스캐너로 모바일 QR 코드를 비추어 주세요.<br />
                (스캐너가 없는 경우 아래 수동 시뮬레이션 창을 사용하세요.)
              </p>
              <div style={scanAlertBox}>
                <ShieldAlert size={14} style={{ marginRight: '6px', color: 'var(--accent)' }} />
                <span>마우스 포커스를 인풋에 두지 않아도 백그라운드 스캔이 연동됩니다.</span>
              </div>
            </div>
          )}

          {scanStatus === 'success' && scannedAttendee && (
            <div style={{ ...statusContainer, animation: 'fadeIn 0.2s ease-out' }}>
              <div style={successIconWrapper}>
                <CheckCircle2 size={56} style={{ color: '#10b981' }} />
              </div>
              <h3 style={successTitle}>참가자 확인 완료</h3>
              
              {/* 대형 명찰 정보 팝업 */}
              <div style={attendeeDataPanel}>
                <div style={badgeTypeRow(scannedAttendee.type)}>
                  {scannedAttendee.type}
                </div>
                <div style={attendeeOrgText}>{scannedAttendee.organization}</div>
                <div style={attendeeNameText}>
                  {scannedAttendee.name}
                  <span style={attendeePosText}>{scannedAttendee.position}</span>
                </div>
                <div style={attendeeCodeText}>등록코드: {scannedAttendee.code}</div>
              </div>

              <div style={timerBoxStyle}>
                <span style={spinnerIcon} />
                <span>1.5초 후 명찰(라벨)이 자동으로 인쇄됩니다...</span>
              </div>
            </div>
          )}

          {scanStatus === 'printing' && scannedAttendee && (
            <div style={statusContainer}>
              <div className="glow" style={printingIconWrapper}>
                <Printer size={56} style={{ color: 'var(--mint)', animation: 'bounce 1s infinite' }} />
              </div>
              <h3 style={printingTitle}>명찰 발급 중</h3>
              <p style={printingDesc}>
                <strong>{scannedAttendee.name}</strong> 님의 명찰 인쇄 작업이 프린터로 전송되었습니다.
              </p>
              <div style={printerPaperAnimation}>
                <div style={paperStrip} />
              </div>
            </div>
          )}

          {scanStatus === 'error' && (
            <div style={statusContainer}>
              <div style={errorIconWrapper}>
                <AlertTriangle size={56} style={{ color: '#ef4444' }} />
              </div>
              <h3 style={errorTitle}>인식 오류</h3>
              <p style={errorDesc}>{errorMessage}</p>
            </div>
          )}
        </div>

        {/* 수동 스캔 시뮬레이터 (장비 없을 시 테스트용) */}
        <div className="glass" style={manualScanPanel}>
          <div style={manualPanelHeader}>
            <Volume2 size={16} style={{ color: 'var(--text-secondary)' }} />
            <h3 style={manualTitle}>스캐너 및 사운드 테스트</h3>
          </div>
          <p style={manualDesc}>
            실제 바코드 스캐너 장비가 없는 경우, 사전등록번호(예: 10001, 10002 등)를 직접 입력하여 스캔 동작을 시뮬레이션할 수 있습니다.
          </p>

          <form onSubmit={handleManualScanSubmit} style={manualForm}>
            <div style={inputGroup}>
              <input 
                id="manual-scan-input"
                type="text" 
                placeholder="사전등록코드 입력 (예: 10001)" 
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                style={manualInput}
                disabled={scanStatus !== 'idle'}
              />
              <button 
                type="submit" 
                style={btnManualScan}
                disabled={scanStatus !== 'idle' || !scanInput}
              >
                가상 스캔
              </button>
            </div>
          </form>

          <div style={testButtonsRow}>
            <button style={btnTestSound('success')} onClick={() => playSound('success')}>
              성공 비프음 테스트
            </button>
            <button style={btnTestSound('error')} onClick={() => playSound('error')}>
              에러 알림음 테스트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   CSS IN JS (OnsiteScanner UI)
   ========================================== */
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const scannerHeaderStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '12px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1.2rem',
};

const headerTextWrapper: React.CSSProperties = {
  flex: 1,
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  marginTop: '0.2rem',
};

const deskSelectorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  backgroundColor: 'var(--bg-tertiary)',
  padding: '0.6rem 1rem',
  borderRadius: '8px',
  border: '1px solid var(--border)',
};

const deskLabelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
};

const selectStyle: React.CSSProperties = {
  padding: '0.3rem 0.5rem',
  fontSize: '0.85rem',
  background: 'var(--bg-primary)',
};

const scannerLayoutGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.7fr 1fr',
  gap: '1.5rem',
  alignItems: 'start',
};

const mainDisplayCard: React.CSSProperties = {
  borderRadius: '12px',
  padding: '3rem 2rem',
  minHeight: '440px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const statusContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
};

const pulseScannerRing: React.CSSProperties = {
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  backgroundColor: 'rgba(16, 185, 129, 0.05)',
  border: '2px solid rgba(16, 185, 129, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem',
  animation: 'pulse 2s infinite',
};

const statusTitle: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: '700',
  marginBottom: '0.5rem',
  color: 'var(--text-primary)',
};

const statusDesc: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  marginBottom: '1.5rem',
};

const scanAlertBox: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'var(--accent-light)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  color: 'var(--accent)',
};

/* Success Panel */
const successIconWrapper: React.CSSProperties = {
  marginBottom: '1rem',
};

const successTitle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: '700',
  color: '#10b981',
  marginBottom: '1.5rem',
};

const attendeeDataPanel: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#000000',
  borderRadius: '8px',
  padding: '1.5rem 2rem',
  width: '100%',
  maxWidth: '380px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '1px solid #e5e7eb',
  marginBottom: '1.5rem',
  textAlign: 'center',
};

const badgeTypeRow = (type: string): React.CSSProperties => {
  let color = '#3b82f6';
  if (type === 'VIP') color = '#fbbf24';
  else if (type === '연사') color = '#8b5cf6';
  else if (type === '스태프') color = '#ef4444';
  else if (type === '기자') color = '#06b6d4';

  return {
    fontSize: '0.75rem',
    fontWeight: '800',
    backgroundColor: color,
    color: '#ffffff',
    padding: '0.2rem 0.8rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  };
};

const attendeeOrgText: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#4b5563',
  fontWeight: '500',
  marginBottom: '0.5rem',
  wordBreak: 'break-all',
};

const attendeeNameText: React.CSSProperties = {
  fontSize: '1.8rem',
  fontWeight: '800',
  color: '#000000',
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
};

const attendeePosText: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: '500',
  color: '#374151',
};

const attendeeCodeText: React.CSSProperties = {
  marginTop: '0.75rem',
  fontSize: '0.8rem',
  fontFamily: 'monospace',
  color: '#6b7280',
  borderTop: '1px dashed #d1d5db',
  width: '100%',
  paddingTop: '0.5rem',
};

const timerBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
};

const spinnerIcon: React.CSSProperties = {
  width: '14px',
  height: '14px',
  border: '2px solid rgba(255,255,255,0.1)',
  borderTop: '2px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

/* Printing Panel */
const printingIconWrapper: React.CSSProperties = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  backgroundColor: 'rgba(52, 211, 153, 0.05)',
  border: '2px solid rgba(52, 211, 153, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem',
};

const printingTitle: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: '700',
  color: 'var(--mint)',
  marginBottom: '0.5rem',
};

const printingDesc: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  marginBottom: '1.5rem',
};

const printerPaperAnimation: React.CSSProperties = {
  width: '80px',
  height: '8px',
  backgroundColor: 'var(--border)',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '2px',
};

const paperStrip: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '10px',
  width: '60px',
  height: '20px',
  backgroundColor: '#ffffff',
  animation: 'slideDown 1.5s ease-out infinite',
};

/* Error Panel */
const errorIconWrapper: React.CSSProperties = {
  marginBottom: '1rem',
};

const errorTitle: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: '700',
  color: '#ef4444',
  marginBottom: '0.5rem',
};

const errorDesc: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#f87171',
  maxWidth: '360px',
  lineHeight: '1.5',
};

/* Manual Scan Panel */
const manualScanPanel: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
};

const manualPanelHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '0.75rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.5rem',
};

const manualTitle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const manualDesc: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.45',
  marginBottom: '1rem',
};

const manualForm: React.CSSProperties = {
  marginBottom: '1.2rem',
};

const inputGroup: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
};

const manualInput: React.CSSProperties = {
  flex: 1,
  fontSize: '0.85rem',
  padding: '0.5rem 0.75rem',
};

const btnManualScan: React.CSSProperties = {
  padding: '0.5rem 1rem',
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  fontSize: '0.85rem',
  fontWeight: '600',
  borderRadius: '6px',
};

const testButtonsRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const btnTestSound = (styleType: 'success' | 'error'): React.CSSProperties => ({
  width: '100%',
  padding: '0.5rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '6px',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  color: styleType === 'success' ? 'var(--accent)' : '#f87171',
  textAlign: 'center',
});
