import React, { useState, useEffect } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import { IdCardTemplate } from './IdCardTemplate';
import type { Attendee } from '../types';
import { Settings, Sliders, Printer, RefreshCw, Trash2, ShieldAlert, QrCode, ExternalLink } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { 
    deskId, 
    setDeskId, 
    settings, 
    updateSettings, 
    clearAllData, 
    generateDummyData 
  } = useAttendees();

  // 입력 필드 상태
  const [widthInput, setWidthInput] = useState(String(settings.pageWidth));
  const [heightInput, setHeightInput] = useState(String(settings.pageHeight));

  // Context 설정값이 바뀔 때 입력 필드 최신화
  useEffect(() => {
    setWidthInput(String(settings.pageWidth));
    setHeightInput(String(settings.pageHeight));
  }, [settings]);

  // 설정 저장
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(widthInput);
    const h = parseFloat(heightInput);

    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      alert('올바른 용지 크기 수치를 입력해 주세요.');
      return;
    }

    if (w < 40 || w > 150 || h < 30 || h > 120) {
      if (!window.confirm('입력하신 규격이 일반적인 MICE 명찰 표준 규격(가로 40~150mm, 세로 30~120mm)을 벗어납니다. 그대로 적용하시겠습니까?')) {
        return;
      }
    }

    updateSettings({
      pageWidth: w,
      pageHeight: h
    });
    alert(`명찰 용지 규격이 가로 ${w}mm, 세로 ${h}mm로 변경 및 인쇄 엔진에 반영되었습니다.`);
  };

  // 실시간 미리보기를 위한 가상 참가자 데이터
  const previewAttendee: Attendee = {
    id: 'preview-1',
    code: '99999',
    type: 'VIP',
    organization: '고양시 킨텍스(KINTEX) 디자인팀',
    position: '수석연구원',
    name: '김고양',
    isAttended: false,
    registeredType: '사전',
    printedCount: 0
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      <div style={gridStyle}>
        
        {/* 좌측 세팅 폼 패널 */}
        <div style={leftPanel}>
          
          {/* 기기 등록 & 운영 데스크 세팅 */}
          <div className="glass" style={cardStyle}>
            <div style={panelHeaderStyle}>
              <Settings size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={panelTitleStyle}>현재 기기 등록 및 데스크 세팅</h3>
            </div>
            <p style={cardDesc}>
              현장 3대 이상의 다중 스캐너를 배치하여 운영할 때, 현재 컴퓨터/태블릿이 몇 번 데스크인지 지정합니다.
            </p>
            <div style={formGroupStyle}>
              <label style={labelStyle}>지정 운영 데스크 ID</label>
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

          {/* 바코드 프린터 용지 세팅 */}
          <div className="glass" style={{ ...cardStyle, marginTop: '1.5rem' }}>
            <div style={panelHeaderStyle}>
              <Printer size={18} style={{ color: 'var(--mint)' }} />
              <h3 style={panelTitleStyle}>바코드 라벨 프린터 용지 세팅</h3>
            </div>
            <p style={cardDesc}>
              행사장에서 사용하는 실제 바코드 라벨 프린터의 라벨지 크기(가로x세로 mm)를 입력하면 인쇄 레이아웃과 CSS가 그에 맞춰 실시간 스케일링됩니다.
            </p>
            
            <form onSubmit={handleSaveSettings} style={formStyle}>
              <div style={inlineFormRow}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>가로 크기 (Width, mm)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={widthInput} 
                    onChange={(e) => setWidthInput(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>세로 크기 (Height, mm)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={heightInput} 
                    onChange={(e) => setHeightInput(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={infoBoxStyle}>
                <ShieldAlert size={14} style={{ marginRight: '6px', color: 'var(--accent)', flexShrink: 0 }} />
                <span>여기에 입력한 용지 크기는 윈도우 인쇄 드라이버 속성창의 크기와 일치해야 정밀한 출력이 이루어집니다.</span>
              </div>

              <button type="submit" style={btnSubmitStyle}>
                <Sliders size={14} style={{ marginRight: '6px' }} />
                용지 규격 업데이트 반영
              </button>
            </form>
          </div>

          {/* 데이터 초기화 관리 */}
          <div className="glass" style={{ ...cardStyle, marginTop: '1.5rem' }}>
            <div style={panelHeaderStyle}>
              <Trash2 size={18} style={{ color: '#f87171' }} />
              <h3 style={panelTitleStyle}>통합 데이터베이스 관리</h3>
            </div>
            <p style={cardDesc}>
              현장 테스트 및 초기 셋업 시 데이터를 복구하거나 전체 로그를 초기화할 수 있습니다.
            </p>
            <div style={dangerButtonGroup}>
              <button style={btnDummyStyle} onClick={generateDummyData}>
                <RefreshCw size={14} style={{ marginRight: '6px' }} />
                시연용 디폴트 더미 복구
              </button>
              <button style={btnDeleteStyle} onClick={() => {
                if (window.confirm('전체 데이터를 삭제하시겠습니까? 복구할 수 없습니다.')) {
                  clearAllData();
                }
              }}>
                <Trash2 size={14} style={{ marginRight: '6px' }} />
                전체 참가자 & 로그 삭제
              </button>
            </div>
          </div>

        </div>

        {/* 우측 명찰 크기 실시간 미리보기 및 모바일 QR 코드 */}
        <div style={rightPanel}>
          
          {/* 용지 미리보기 */}
          <div className="glass" style={{ ...previewCardStyle, width: '100%' }}>
            <div style={panelHeaderStyle}>
              <Sliders size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={panelTitleStyle}>라벨 인쇄 비율 실시간 미리보기 (비율: 100%)</h3>
            </div>
            <p style={cardDesc}>
              현재 설정된 용지 가로/세로 규격 비율로 라벨 디자인이 어떻게 안착되는지 가상으로 미리봅니다.
            </p>

            <div style={previewViewport}>
              <div 
                style={{
                  width: `${settings.pageWidth}mm`,
                  height: `${settings.pageHeight}mm`,
                  border: '2px solid var(--accent)',
                  boxShadow: '0 10px 25px rgba(16, 185, 129, 0.1)',
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  overflow: 'hidden'
                }}
              >
                <IdCardTemplate attendee={previewAttendee} />
              </div>

              {/* 치수 가이드라인선 */}
              <div style={dimensionLabelRow}>
                <div style={widthGuide}>
                  <span style={arrowLeft}>◀</span>
                  <span style={dimensionText}>{settings.pageWidth} mm</span>
                  <span style={arrowRight}>▶</span>
                </div>
                <div style={heightGuide}>
                  <span style={arrowUp}>▲</span>
                  <span style={dimensionText}>{settings.pageHeight} mm</span>
                  <span style={arrowDown}>▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* 모바일 현장 셀프 등록 QR & 안내 */}
          <div className="glass" style={{ ...previewCardStyle, width: '100%', marginTop: '1.5rem' }}>
            <div style={panelHeaderStyle}>
              <QrCode size={18} style={{ color: 'var(--mint)' }} />
              <h3 style={panelTitleStyle}>모바일 현장 셀프 등록용 QR 및 URL</h3>
            </div>
            <p style={cardDesc}>
              행사장 외부 배너나 입간판에 노출할 QR코드입니다. 참가자가 스마트폰으로 아래 QR을 스캔하면 관리자 도구 없이 본인의 정보(이메일, 연락처, 개인정보동의 포함)를 현장에서 셀프 입력할 수 있는 화면으로 접속됩니다.
            </p>

            <div style={qrGuideArea}>
              <div style={qrCodeBox}>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/?view=public-register')}`} 
                  alt="Public Register QR" 
                  style={{ width: '120px', height: '120px' }}
                />
              </div>
              <div style={qrInfoBox}>
                <div style={urlTextContainer}>
                  <span style={urlLabel}>모바일 셀프등록 주소</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={window.location.origin + '/?view=public-register'} 
                    style={urlInputStyle}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <a 
                  href={window.location.origin + '/?view=public-register'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={btnOpenLink}
                >
                  <ExternalLink size={14} style={{ marginRight: '6px' }} />
                  셀프 등록 페이지 새창 열기
                </a>
              </div>
            </div>

            {/* 외부 터널링 가이드 */}
            <div style={tunnelGuideCard}>
              <div style={tunnelGuideHeader}>
                <ShieldAlert size={14} style={{ color: 'var(--accent)', marginRight: '6px' }} />
                <span style={{ fontWeight: '700' }}>외부망(LTE/5G) 스마트폰 접속 및 서비스 방법</span>
              </div>
              <p style={tunnelGuideDesc}>
                현재 구동 중인 로컬 서버(localhost)는 현장 내부 네트워크용입니다. 일반 참가자의 스마트폰(LTE/5G)에서 입간판 QR을 스캔하여 모바일로 자율 등록하게 하려면 아래의 터널링 중계 명령어를 실행하세요.
              </p>
              <div style={codeBlockStyle}>
                <code>npx localtunnel --port 5173</code>
              </div>
              <p style={tunnelGuideSubdesc}>
                위 명령어를 새 파워쉘/터미널 창에 입력하여 실행하면 외부 공인 주소(예: <code>https://xxxx.loca.lt</code>)가 즉석 발급됩니다. 발급된 주소 뒤에 <code>/?view=public-register</code> 주소를 조합하여 현장 외부 배너용 QR코드를 인쇄하시면 완벽한 외부 인터넷 등록 서비스가 개시됩니다.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

/* ==========================================
   CSS IN JS (SettingsPanel UI)
   ========================================== */
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
  gap: '1.5rem',
  alignItems: 'start',
};

const leftPanel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const rightPanel: React.CSSProperties = {
  padding: '2rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const cardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '12px',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.8rem',
  marginBottom: '1rem',
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const cardDesc: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  marginBottom: '1.2rem',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
};

const selectStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  width: '100%',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inlineFormRow: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
};

const inputStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  width: '100%',
};

const infoBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'var(--accent-light)',
  border: '1px solid rgba(16, 185, 129, 0.15)',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  fontSize: '0.7rem',
  color: 'var(--accent)',
  lineHeight: '1.4',
};

const btnSubmitStyle: React.CSSProperties = {
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  padding: '0.6rem 1rem',
  fontSize: '0.85rem',
  fontWeight: '600',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const dangerButtonGroup: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
};

const btnDummyStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  padding: '0.6rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const btnDeleteStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#f87171',
  padding: '0.6rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const previewViewport: React.CSSProperties = {
  width: '100%',
  minHeight: '300px',
  backgroundColor: 'rgba(0,0,0,0.15)',
  border: '1px dashed var(--border)',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: '30px',
};

const dimensionLabelRow: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
};

const widthGuide: React.CSSProperties = {
  position: 'absolute',
  bottom: '8px',
  left: '30px',
  right: '30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'var(--accent)',
  fontSize: '0.75rem',
  fontWeight: '600',
};

const heightGuide: React.CSSProperties = {
  position: 'absolute',
  right: '8px',
  top: '30px',
  bottom: '30px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: 'var(--accent)',
  fontSize: '0.75rem',
  fontWeight: '600',
};

const dimensionText: React.CSSProperties = {
  backgroundColor: 'var(--bg-primary)',
  padding: '2px 6px',
  border: '1px solid var(--border)',
  borderRadius: '4px',
};

const arrowLeft: React.CSSProperties = { fontSize: '0.6rem', color: 'var(--text-muted)' };
const arrowRight: React.CSSProperties = { fontSize: '0.6rem', color: 'var(--text-muted)' };
const arrowUp: React.CSSProperties = { fontSize: '0.6rem', color: 'var(--text-muted)' };
const arrowDown: React.CSSProperties = { fontSize: '0.6rem', color: 'var(--text-muted)' };

const previewCardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '12px',
};

const qrGuideArea: React.CSSProperties = {
  display: 'flex',
  gap: '1.2rem',
  alignItems: 'center',
  marginTop: '0.5rem',
};

const qrCodeBox: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '8px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const qrInfoBox: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  flex: 1,
};

const urlTextContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
};

const urlLabel: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
};

const urlInputStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  padding: '0.5rem',
  width: '100%',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: '4px',
  cursor: 'pointer',
};

const btnOpenLink: React.CSSProperties = {
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  padding: '0.5rem 1rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  textAlign: 'center',
};

/* Localtunnel External Network Guide Styling */
const tunnelGuideCard: React.CSSProperties = {
  marginTop: '1.2rem',
  padding: '0.85rem',
  borderRadius: '6px',
  backgroundColor: 'rgba(16, 185, 129, 0.03)',
  border: '1px solid rgba(16, 185, 129, 0.12)',
  fontSize: '0.72rem',
};

const tunnelGuideHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  color: 'var(--accent)',
  marginBottom: '0.4rem',
};

const tunnelGuideDesc: React.CSSProperties = {
  color: 'var(--text-secondary)',
  lineHeight: '1.45',
  marginBottom: '0.6rem',
};

const codeBlockStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  padding: '0.5rem',
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  color: 'var(--mint)',
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: '0.6rem',
};

const tunnelGuideSubdesc: React.CSSProperties = {
  color: 'var(--text-muted)',
  lineHeight: '1.4',
};
