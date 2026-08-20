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

  // 미리보기 모드 상태 (내국인 홍길동 vs 외국인 John Doe)
  const [previewMode, setPreviewMode] = useState<'Domestic' | 'Foreign'>('Domestic');

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

  // 실시간 미리보기를 위한 가상 참가자 데이터 (홍길동 & John Doe)
  const previewAttendee: Attendee = previewMode === 'Domestic' ? {
    id: 'preview-1',
    code: '99999',
    nationality: 'Domestic',
    type: 'Organizer',
    name: 'Gildong Hong (홍길동)',
    nameEn: 'Gildong Hong',
    nameKr: '홍길동',
    position: 'Manager / 팀장',
    positionEn: 'Manager',
    positionKr: '팀장',
    organization: 'Global MICE Corp / 한국컨벤션센터',
    organizationEn: 'Global MICE Corp',
    organizationKr: '한국컨벤션센터',
    isAttended: false,
    registeredType: '사전',
    printedCount: 0
  } : {
    id: 'preview-2',
    code: '88888',
    nationality: 'Foreign',
    type: 'Speaker',
    name: 'John Doe',
    nameEn: 'John Doe',
    position: 'Chief Executive Officer',
    positionEn: 'Chief Executive Officer',
    organization: 'World Event Federation',
    organizationEn: 'World Event Federation',
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
                  <label style={labelStyle}>용지 가로 (Width, mm)</label>
                  <input 
                    type="number" 
                    step="1"
                    min="40"
                    max="150"
                    value={widthInput} 
                    onChange={(e) => setWidthInput(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>용지 세로 (Height, mm)</label>
                  <input 
                    type="number" 
                    step="1"
                    min="30"
                    max="120"
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
                용지 규격 저장 및 인쇄 엔진 동기화
              </button>
            </form>
          </div>

          {/* 데이터 초기화 및 덤프 생성 버튼 */}
          <div className="glass" style={{ ...cardStyle, marginTop: '1.5rem' }}>
            <div style={panelHeaderStyle}>
              <ShieldAlert size={18} style={{ color: '#ef4444' }} />
              <h3 style={panelTitleStyle}>시스템 데이터 관리</h3>
            </div>
            <p style={cardDesc}>
              테스트 데이터를 초기화하거나 데모용 시뮬레이션 참가자 명단을 다시 생성합니다.
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

        {/* 우측 실시간 미리보기 & QR 연동 패널 */}
        <div style={rightPanel}>
          <div className="glass" style={{ ...previewCardStyle, width: '100%' }}>
            <div style={panelHeaderStyle}>
              <Sliders size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={panelTitleStyle}>라벨 인쇄 비율 실시간 미리보기 (비율: 100%)</h3>
            </div>
            <p style={cardDesc}>
              현재 설정된 용지 가로/세로 규격 비율로 라벨 디자인이 어떻게 안착되는지 가상으로 미리봅니다.
            </p>

            {/* 내국인 (홍길동) / 외국인 (John Doe) 미리보기 전환 탭 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '0.3rem',
              borderRadius: '8px',
              margin: '0.8rem 0 1.2rem 0'
            }}>
              <button
                type="button"
                style={{
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: previewMode === 'Domestic' ? 'var(--accent)' : 'transparent',
                  color: previewMode === 'Domestic' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                onClick={() => setPreviewMode('Domestic')}
              >
                🇰🇷 내국인 (홍길동) 미리보기
              </button>
              <button
                type="button"
                style={{
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: previewMode === 'Foreign' ? 'var(--accent)' : 'transparent',
                  color: previewMode === 'Foreign' ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
                onClick={() => setPreviewMode('Foreign')}
              >
                🌐 외국인 (John Doe) 미리보기
              </button>
            </div>

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
                  href="/?view=public-register" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={btnOpenPublicStyle}
                >
                  <ExternalLink size={14} style={{ marginRight: '6px' }} />
                  셀프 등록 페이지 새 창으로 열기
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem 0',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1.5rem',
  alignItems: 'start',
};

const leftPanel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const rightPanel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const cardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '12px',
};

const previewCardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.75rem',
  marginBottom: '0.75rem',
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const cardDesc: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginTop: '1rem',
};

const inlineFormRow: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
};

const selectStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  padding: '0.6rem 0.75rem',
  marginTop: '0.4rem',
};

const inputStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  padding: '0.6rem 0.75rem',
};

const infoBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(16, 185, 129, 0.08)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  padding: '0.6rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  color: 'var(--accent)',
  lineHeight: '1.4',
};

const btnSubmitStyle: React.CSSProperties = {
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  padding: '0.7rem',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const dangerButtonGroup: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  marginTop: '1rem',
};

const btnDummyStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  padding: '0.6rem',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const btnDeleteStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#ef4444',
  padding: '0.6rem',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const previewViewport: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '12px',
  padding: '2.5rem 1.5rem',
  position: 'relative',
};

const dimensionLabelRow: React.CSSProperties = {
  marginTop: '1rem',
  display: 'flex',
  gap: '1.5rem',
  alignItems: 'center',
};

const widthGuide: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.2rem',
};

const heightGuide: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.2rem',
};

const arrowLeft: React.CSSProperties = { fontSize: '0.7rem', color: 'var(--accent)' };
const arrowRight: React.CSSProperties = { fontSize: '0.7rem', color: 'var(--accent)' };
const arrowUp: React.CSSProperties = { fontSize: '0.7rem', color: 'var(--accent)' };
const arrowDown: React.CSSProperties = { fontSize: '0.7rem', color: 'var(--accent)' };

const dimensionText: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  fontFamily: "'Outfit', monospace",
};

const qrGuideArea: React.CSSProperties = {
  display: 'flex',
  gap: '1.2rem',
  alignItems: 'center',
  marginTop: '1rem',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  padding: '1rem',
  borderRadius: '10px',
};

const qrCodeBox: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '0.5rem',
  borderRadius: '8px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const qrInfoBox: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  flex: 1,
};

const urlTextContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
};

const urlLabel: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  fontWeight: '600',
};

const urlInputStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  padding: '0.5rem 0.75rem',
  backgroundColor: 'rgba(0, 0, 0, 0.3)',
  color: 'var(--accent)',
  fontWeight: '600',
  cursor: 'pointer',
};

const btnOpenPublicStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '700',
  textDecoration: 'none',
};
