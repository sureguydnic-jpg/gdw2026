import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import type { Attendee } from '../types';
import { Smartphone, Send, ExternalLink, ShieldAlert, Sparkles, Download } from 'lucide-react';

export const SmsSimulator: React.FC = () => {
  const { attendees } = useAttendees();
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string>('');
  const [receivedSms, setReceivedSms] = useState<{
    text: string;
    attendee: Attendee;
    sentAt: string;
  } | null>(null);
  
  const [showMobileTicket, setShowMobileTicket] = useState(false);

  // 문자 발송 모의 수행
  const handleSendSms = () => {
    const attendee = attendees.find(a => a.id === selectedAttendeeId);
    if (!attendee) {
      alert('참가자를 선택해 주세요.');
      return;
    }

    // 모바일 티켓 URL 구성 (현재 도메인에 연동되도록 동적 URL 생성)
    const ticketUrl = `${window.location.origin}${window.location.pathname}?view=public-register&code=${attendee.code}`;

    // 가상 SMS 텍스트 구성
    const smsText = `[GDW 2026] 안녕하세요, ${attendee.name}님. 'Goyang Destination Week 2026' 사전등록이 완료되었습니다.\n\n▶ 등록코드: ${attendee.code}\n▶ 일시: 2026년 8월 26일(수) ~ 29일(토)\n▶ 장소: 고양꽃전시장\n\n현장 등록 데스크에서 빠른 입장을 위해 아래 링크를 터치하여 모바일 QR 티켓을 제시해 주시기 바랍니다.\n링크: ${ticketUrl}`;

    setReceivedSms({
      text: smsText,
      attendee,
      sentAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    });
    
    setShowMobileTicket(false); // 기존 티켓 창 닫기
  };

  // 사전등록자 전체 대상 대량 문자 엑셀(CSV) 다운로드 함수
  const handleDownloadAllSmsCsv = () => {
    const preRegistered = attendees.filter(a => a.registeredType === '사전');
    
    if (preRegistered.length === 0) {
      alert('다운로드할 사전등록자가 없습니다.');
      return;
    }

    // UTF-8 BOM과 CSV 헤더 구성 (등록코드, 티켓링크 분리 추가)
    let csvContent = '\uFEFF수신번호,이름,소속,직책,등록코드,티켓링크,문자내용\n';
    
    preRegistered.forEach(att => {
      const phone = att.phone || '';
      const name = att.name || '';
      const org = att.organization || '';
      const pos = att.position || '';
      const code = att.code || '';
      
      const ticketUrl = `${window.location.origin}${window.location.pathname}?view=public-register&code=${code}`;
      const smsText = `[GDW 2026] 안녕하세요, ${name}님. 'Goyang Destination Week 2026' 사전등록이 완료되었습니다.\n\n▶ 등록코드: ${code}\n▶ 일시: 2026년 8월 26일(수) ~ 29일(토)\n▶ 장소: 고양꽃전시장\n\n현장 등록 데스크에서 빠른 입장을 위해 아래 링크를 터치하여 모바일 QR 티켓을 제시해 주시기 바랍니다.\n링크: ${ticketUrl}`;
      
      const escape = (text: string) => `"${text.replace(/"/g, '""')}"`;
      csvContent += `${escape(phone)},${escape(name)},${escape(org)},${escape(pos)},${escape(code)},${escape(ticketUrl)},${escape(smsText)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GDW_2026_사전등록_안내문자_발송명단.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      {/* 발송 설정 패널 */}
      <div className="glass" style={senderPanelStyle}>
        <div style={panelHeaderStyle}>
          <Sparkles size={18} style={{ color: 'var(--accent)' }} />
          <h2 style={panelTitleStyle}>안내문자(QR코드 포함) 모의 발송기</h2>
        </div>
        <p style={senderDesc}>
          등록된 사전참가자 중 한 명을 선택하여 행사 안내 및 모바일 QR 티켓 확인 문자를 가상으로 전송합니다.
          스마트폰 화면에서 모바일 QR 링크가 연동되는 과정을 시연할 수 있습니다.
        </p>
        
        <div style={formGroupStyle}>
          <label style={labelStyle}>대상 참가자 선택</label>
          <select 
            value={selectedAttendeeId} 
            onChange={(e) => setSelectedAttendeeId(e.target.value)}
            style={selectStyle}
          >
            <option value="">-- 참가자 선택 --</option>
            {attendees.filter(a => a.registeredType === '사전').map(att => (
              <option key={att.id} value={att.id}>
                [{att.code}] {att.name} ({att.organization} - {att.type})
              </option>
            ))}
          </select>
        </div>

        <button 
          style={{ 
            ...btnSendStyle,
            opacity: selectedAttendeeId ? 1 : 0.6,
            cursor: selectedAttendeeId ? 'pointer' : 'not-allowed'
          }} 
          onClick={handleSendSms}
          disabled={!selectedAttendeeId}
        >
          <Send size={16} style={{ marginRight: '6px' }} />
          가상 안내문자 발송 트리거
        </button>

        {/* 대량 문자 발송용 CSV/엑셀 내보내기 박스 추가 */}
        <div style={exportBoxStyle}>
          <div style={exportTitleStyle}>📊 대량 발송용 데이터 내보내기</div>
          <p style={exportDescStyle}>
            전체 사전등록자 대상의 모의 안내문자 데이터를 엑셀(CSV)로 다운로드합니다. 이 파일을 대량 문자 발송 서비스(뿌리오, 쿨에스엠에스 등)에 그대로 업로드하여 실제 문자 발송이 가능합니다.
          </p>
          <button style={btnExportStyle} onClick={handleDownloadAllSmsCsv}>
            <Download size={15} style={{ marginRight: '6px' }} />
            전체 안내문자 엑셀(CSV) 다운로드
          </button>
        </div>
      </div>

      {/* 스마트폰 목업 시뮬레이터 */}
      <div style={smartphoneWrapperStyle}>
        {/* 외부 스마트폰 베젤 */}
        <div style={phoneFrame}>
          <div style={phoneSpeaker} />
          
          <div style={phoneScreen}>
            {/* 폰 상단 바 */}
            <div style={phoneStatusRow}>
              <span>09:41</span>
              <div style={phoneStatusIcons}>
                <span>LTE</span>
                <span>■ 100%</span>
              </div>
            </div>

            {/* 메신저 앱 헤더 */}
            <div style={phoneAppHeader}>
              <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>◀</span>
              <span style={{ fontWeight: '700' }}>국내발신 [안내센터]</span>
              <span style={{ width: '15px' }} />
            </div>

            {/* 메시지 내용 구역 */}
            <div style={phoneContentArea}>
              <div style={smsTimeStyle}>{receivedSms ? `오늘 ${receivedSms.sentAt}` : '대기 중'}</div>
              
              {receivedSms ? (
                <div style={smsBubbleStyle}>
                  {/* 줄바꿈을 반영하여 렌더링 */}
                  {receivedSms.text.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line.includes('http://') ? (
                        <span 
                          style={smsLinkStyle} 
                          onClick={() => setShowMobileTicket(true)}
                        >
                          {line}
                          <ExternalLink size={10} style={{ marginLeft: '3px', display: 'inline-block' }} />
                        </span>
                      ) : (
                        line
                      )}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div style={phonePlaceholder}>
                  <Smartphone size={36} style={{ color: '#374151', marginBottom: '0.5rem' }} />
                  <p>발송기에서 대상을 선택 후<br />문자를 전송해 주세요.</p>
                </div>
              )}

              {/* 폰 화면 내 모바일 QR 티켓 오버레이 (링크 클릭 시 표시) */}
              {showMobileTicket && receivedSms && (
                <div className="animate-fade-in" style={ticketOverlayStyle}>
                  <div style={ticketHeaderStyle}>
                    <button style={btnTicketClose} onClick={() => setShowMobileTicket(false)}>×</button>
                    <div style={ticketTitle}>MOBILE TICKET</div>
                    <div style={ticketSubTitle}>Goyang Destination Week 2026</div>
                  </div>

                  <div style={ticketBodyStyle}>
                    <div style={ticketRegText}>사전등록 모바일 입장권</div>
                    
                    {/* 실감 나는 큰 QR */}
                    <div style={ticketQrBox}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${receivedSms.attendee.code}`} 
                        alt="Mobile QR" 
                        style={ticketQrImage}
                      />
                      <div style={ticketCodeText}>REG - {receivedSms.attendee.code}</div>
                    </div>

                    <div style={ticketDivider} />

                    <div style={ticketInfoRow}>
                      <span style={ticketInfoLabel}>성 명</span>
                      <span style={ticketInfoVal}>{receivedSms.attendee.name}</span>
                    </div>
                    <div style={ticketInfoRow}>
                      <span style={ticketInfoLabel}>소 속</span>
                      <span style={ticketInfoVal}>{receivedSms.attendee.organization}</span>
                    </div>
                    <div style={ticketInfoRow}>
                      <span style={ticketInfoLabel}>구 분</span>
                      <span style={ticketBadge(receivedSms.attendee.type)}>{receivedSms.attendee.type}</span>
                    </div>
                  </div>
                  
                  <div style={ticketFooterStyle}>
                    <ShieldAlert size={12} style={{ marginRight: '4px', color: '#10b981' }} />
                    현장 데스크 스캐너에 위 QR코드를 인식해 주세요.
                  </div>
                </div>
              )}
            </div>
            
            {/* 홈 인디케이터 바 */}
            <div style={phoneHomeBar} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   CSS IN JS (SmsSimulator UI)
   ========================================== */
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2rem',
  alignItems: 'flex-start',
  justifyContent: 'center',
};

const senderPanelStyle: React.CSSProperties = {
  flex: 1.2,
  minWidth: '320px',
  padding: '2rem',
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

const senderDesc: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  marginBottom: '1.5rem',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginBottom: '1.5rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  fontSize: '0.85rem',
};

const btnSendStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.8rem',
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const smartphoneWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  minWidth: '320px',
};

/* --- Smartphone Mockup Frame --- */
const phoneFrame: React.CSSProperties = {
  width: '320px',
  height: '620px',
  backgroundColor: '#1f2937',
  borderRadius: '40px',
  border: '8px solid #0f172a',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
};

const phoneSpeaker: React.CSSProperties = {
  width: '60px',
  height: '4px',
  backgroundColor: '#374151',
  borderRadius: '2px',
  position: 'absolute',
  top: '16px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
};

const phoneScreen: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#18181b',
  borderRadius: '32px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const phoneStatusRow: React.CSSProperties = {
  height: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '4px 18px 0',
  fontSize: '0.65rem',
  color: '#e5e7eb',
  fontWeight: '600',
  zIndex: 5,
};

const phoneStatusIcons: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
};

const phoneAppHeader: React.CSSProperties = {
  height: '44px',
  backgroundColor: '#27272a',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 12px',
  borderBottom: '1px solid #3f3f46',
  fontSize: '0.85rem',
  color: '#ffffff',
};

const phoneContentArea: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
};

const smsTimeStyle: React.CSSProperties = {
  alignSelf: 'center',
  fontSize: '0.65rem',
  color: '#71717a',
  backgroundColor: '#27272a',
  padding: '2px 8px',
  borderRadius: '10px',
  marginBottom: '12px',
};

const smsBubbleStyle: React.CSSProperties = {
  maxWidth: '85%',
  backgroundColor: '#27272a',
  color: '#e5e7eb',
  padding: '10px 12px',
  borderRadius: '16px 16px 16px 2px',
  fontSize: '0.75rem',
  lineHeight: '1.45',
  wordBreak: 'break-all',
  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
};

const smsLinkStyle: React.CSSProperties = {
  color: '#34d399',
  textDecoration: 'underline',
  cursor: 'pointer',
  fontWeight: '600',
};

const phonePlaceholder: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#52525b',
  textAlign: 'center',
  fontSize: '0.75rem',
  lineHeight: '1.5',
};

const phoneHomeBar: React.CSSProperties = {
  width: '100px',
  height: '4px',
  backgroundColor: '#4b5563',
  borderRadius: '2px',
  position: 'absolute',
  bottom: '8px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10,
};

/* --- Mobile Ticket Overlay (Phone Internal Viewport) --- */
const ticketOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: '#0a0f0d',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  padding: '12px 14px',
};

const ticketHeaderStyle: React.CSSProperties = {
  position: 'relative',
  textAlign: 'center',
  borderBottom: '1px solid #1f352e',
  paddingBottom: '8px',
  marginBottom: '10px',
};

const btnTicketClose: React.CSSProperties = {
  position: 'absolute',
  right: '0',
  top: '-2px',
  fontSize: '1.5rem',
  color: '#9ca3af',
  background: 'none',
  padding: '0 4px',
  fontWeight: '300',
};

const ticketTitle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '700',
  letterSpacing: '1px',
  color: '#10b981',
};

const ticketSubTitle: React.CSSProperties = {
  fontSize: '0.55rem',
  color: '#6b7280',
  marginTop: '2px',
};

const ticketBodyStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: '#111815',
  border: '1px solid #1f352e',
  borderRadius: '12px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const ticketRegText: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '600',
  color: '#9ca3af',
  marginBottom: '8px',
};

const ticketQrBox: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '10px',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '12px',
};

const ticketQrImage: React.CSSProperties = {
  width: '110px',
  height: '110px',
};

const ticketCodeText: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#000000',
  marginTop: '6px',
  fontFamily: 'monospace',
};

const ticketDivider: React.CSSProperties = {
  width: '100%',
  borderTop: '1px dashed #1f352e',
  margin: '10px 0',
};

const ticketInfoRow: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '0.75rem',
};

const ticketInfoLabel: React.CSSProperties = {
  color: '#9ca3af',
};

const ticketInfoVal: React.CSSProperties = {
  fontWeight: '600',
  color: '#f3f4f6',
};

const ticketBadge = (type: string): React.CSSProperties => {
  let color = '#3b82f6';
  if (type === 'VIP') color = '#fbbf24';
  else if (type === '연사') color = '#a78bfa';
  else if (type === '스태프') color = '#f87171';
  else if (type === '기자') color = '#2dd4bf';

  return {
    fontSize: '0.65rem',
    fontWeight: '700',
    color,
    backgroundColor: `${color}15`,
    padding: '1px 6px',
    borderRadius: '3px',
    border: `1px solid ${color}30`,
  };
};

const ticketFooterStyle: React.CSSProperties = {
  marginTop: '10px',
  fontSize: '0.65rem',
  color: '#9ca3af',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const exportBoxStyle: React.CSSProperties = {
  marginTop: '2rem',
  paddingTop: '1.5rem',
  borderTop: '1px dashed var(--border)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
};

const exportTitleStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--accent)',
};

const exportDescStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.45',
  margin: 0,
};

const btnExportStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.25)',
  color: 'var(--mint)',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
};
