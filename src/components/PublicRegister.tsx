import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import type { Attendee } from '../types';
import { Sparkles, CheckCircle, Shield, Phone, Mail, Award, ArrowLeft } from 'lucide-react';

export const PublicRegister: React.FC = () => {
  const { addAttendee, attendees } = useAttendees();
  
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [privacyAgree, setPrivacyAgree] = useState(false);

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [registeredAttendee, setRegisteredAttendee] = useState<Attendee | null>(null);

  // URL 쿼리 파라미터에서 code가 전달되면 해당 사전등록자의 티켓 정보를 로드
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const codeParam = searchParams.get('code');
    if (codeParam && attendees.length > 0) {
      const found = attendees.find(a => a.code === codeParam);
      if (found) {
        setRegisteredAttendee(found);
        setStep('success');
      }
    }
  }, [attendees]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !organization.trim() || !position.trim() || !phone.trim() || !email.trim()) {
      alert('모든 입력 항목을 기입해 주세요.');
      return;
    }

    if (!privacyAgree) {
      alert('개인정보 수집 및 이용에 동의해 주셔야 등록이 완료됩니다.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      alert('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    const phoneRegex = /^[0-9+-\s]+$/;
    if (!phoneRegex.test(phone.trim())) {
      alert('올바른 연락처 형식을 입력해 주세요.');
      return;
    }

    const created = addAttendee({
      name: name.trim(),
      organization: organization.trim(),
      position: position.trim(),
      phone: phone.trim(),
      email: email.trim(),
      type: '일반',
      privacyAgree: true,
      registeredType: '현장'
    });

    setRegisteredAttendee(created);
    setStep('success');
  };

  const handleResetForm = () => {
    setName('');
    setOrganization('');
    setPosition('');
    setPhone('');
    setEmail('');
    setPrivacyAgree(false);
    setStep('form');
    setRegisteredAttendee(null);
  };

  return (
    <div style={viewportStyle}>
      <div className="glass glow" style={containerStyle}>
        
        <div style={headerStyle}>
          <Sparkles size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <h1 style={titleStyle}>GOYANG DESTINATION WEEK 2026</h1>
            <p style={subtitleStyle}>고양 데스티네이션 위크 모바일 현장 등록</p>
          </div>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleRegisterSubmit} style={formStyle}>
            <div style={formDescBox}>
              <p>행사장에 방문해 주셔서 감사합니다.</p>
              <p style={{ marginTop: '0.2rem', color: 'var(--text-secondary)' }}>
                아래 인적사항을 작성하시면 모바일 입장권이 즉시 발급됩니다.
              </p>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>성명 (Name)</label>
              <input 
                type="text" 
                placeholder="홍길동 (또는 영문명)" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>소속 기관 / 회사명 (Organization)</label>
              <input 
                type="text" 
                placeholder="예: 고양시청, 킨텍스, 한국MICE협회" 
                value={organization} 
                onChange={(e) => setOrganization(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>직책 (Position)</label>
              <input 
                type="text" 
                placeholder="예: 팀장, 연구원, 과장, 대표 등" 
                value={position} 
                onChange={(e) => setPosition(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>연락처 (Phone)</label>
              <div style={inputIconWrapper}>
                <Phone size={14} style={inputIcon} />
                <input 
                  type="tel" 
                  placeholder="예: 010-1234-5678" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputWithIconStyle}
                  required
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>이메일 주소 (Email)</label>
              <div style={inputIconWrapper}>
                <Mail size={14} style={inputIcon} />
                <input 
                  type="email" 
                  placeholder="example@gdw.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputWithIconStyle}
                  required
                />
              </div>
            </div>

            <div style={privacyCardStyle}>
              <div style={privacyHeader}>
                <Shield size={14} style={{ color: 'var(--mint)', marginRight: '4px' }} />
                <span>개인정보 수집 및 이용 동의 (필수)</span>
              </div>
              <div style={privacyTextArea}>
                [고양 데스티네이션 위크 2026 사무국]은 본 행사 등록과 명찰 인쇄 및 참가 확인 관리를 목적으로 아래의 개인정보를 수집합니다.
                <br /><br />
                1. 수집 항목: 성명, 소속, 직책, 연락처, 이메일 주소
                <br />
                2. 수집 및 이용 목적: 고양 데스티네이션 위크 2026 참가 승인, 입장 확인(ID카드 인쇄), 행사 종료 후 만족도 조사 안내
                <br />
                3. 보유 및 이용 기간: 수집 일로부터 1년 보유 후 즉시 폐기 처리
                <br /><br />
                * 귀하는 개인정보 수집 및 이용에 동의하지 않을 권리가 있으나, 동의 거부 시 현장 셀프 입장권 등록 및 발급이 불가능합니다.
              </div>
              <label style={agreeLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={privacyAgree}
                  onChange={(e) => setPrivacyAgree(e.target.checked)}
                  style={checkboxStyle}
                  required
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                  위 개인정보 수집 약관에 동의합니다.
                </span>
              </label>
            </div>

            <button type="submit" style={btnSubmitStyle}>
              현장 모바일 등록 완료 & 입장권 받기
            </button>
          </form>
        ) : (
          <div className="animate-fade-in" style={successWrapper}>
            <div style={successHeader}>
              <CheckCircle size={48} style={{ color: 'var(--accent)', marginBottom: '0.5rem' }} />
              <h2 style={successTitle}>현장 등록 완료!</h2>
              <p style={successDesc}>입장용 모바일 QR 티켓이 정상적으로 발급되었습니다.</p>
            </div>

            {registeredAttendee && (
              <div style={ticketCardStyle}>
                <div style={ticketHeader}>
                  <Award size={16} style={{ color: '#ffffff', marginRight: '4px' }} />
                  <span>GOYANG DESTINATION WEEK 2026</span>
                </div>

                <div style={ticketBody}>
                  <span style={badgeStyle}>현장등록</span>
                  
                  <div style={qrBoxStyle}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${registeredAttendee.code}`} 
                      alt="Self Registration QR" 
                      style={qrImageStyle}
                    />
                    <div style={codeText}>REG - {registeredAttendee.code}</div>
                  </div>

                  <div style={ticketDivider} />

                  <div style={infoRowStyle}>
                    <span style={infoLabel}>성 명</span>
                    <span style={infoVal}>{registeredAttendee.name}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabel}>소 속</span>
                    <span style={infoVal}>{registeredAttendee.organization}</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabel}>직 책</span>
                    <span style={infoVal}>{registeredAttendee.position}</span>
                  </div>
                </div>

                <div style={ticketFooter}>
                  입장 데스크의 바코드 스캐너에 위 QR코드를 비추시면 명찰이 자동으로 즉시 인쇄됩니다.
                </div>
              </div>
            )}

            <button style={btnBackStyle} onClick={handleResetForm}>
              <ArrowLeft size={14} style={{ marginRight: '6px' }} />
              신규 현장 등록하기
            </button>
          </div>
        )}
        
        <div style={footerStyle}>
          © 2026 Goyang Destination Week. All rights reserved.
        </div>

      </div>
    </div>
  );
};

const viewportStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'var(--bg-primary)',
  padding: '1rem',
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '460px',
  borderRadius: '20px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '1rem',
  marginBottom: '1.2rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '800',
  letterSpacing: '0.5px',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-title)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'var(--accent)',
  fontWeight: '600',
  marginTop: '2px',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const formDescBox: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-primary)',
  lineHeight: '1.4',
  backgroundColor: 'rgba(255,255,255,0.02)',
  padding: '0.75rem',
  borderRadius: '8px',
  borderLeft: '3px solid var(--accent)',
  marginBottom: '0.5rem',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
};

const inputStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  padding: '0.6rem 0.75rem',
};

const inputIconWrapper: React.CSSProperties = {
  position: 'relative',
  width: '100%',
};

const inputIcon: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
};

const inputWithIconStyle: React.CSSProperties = {
  width: '100%',
  paddingLeft: '2.4rem',
  fontSize: '0.85rem',
};

const privacyCardStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: '8px',
  backgroundColor: 'var(--bg-secondary)',
  padding: '0.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
};

const privacyHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const privacyTextArea: React.CSSProperties = {
  height: '110px',
  overflowY: 'auto',
  fontSize: '0.7rem',
  color: 'var(--text-secondary)',
  backgroundColor: 'var(--bg-tertiary)',
  padding: '0.5rem',
  borderRadius: '4px',
  lineHeight: '1.45',
  border: '1px solid var(--border)',
};

const agreeLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  padding: '0.2rem 0',
};

const checkboxStyle: React.CSSProperties = {
  width: '15px',
  height: '15px',
  accentColor: 'var(--accent)',
  cursor: 'pointer',
};

const btnSubmitStyle: React.CSSProperties = {
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  padding: '0.8rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '0.5rem',
};

const successWrapper: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const successHeader: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '1.2rem',
};

const successTitle: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: '800',
  color: 'var(--accent)',
};

const successDesc: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  marginTop: '2px',
};

const ticketCardStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#111815',
  border: '1px solid #1f352e',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',
  marginBottom: '1.5rem',
};

const ticketHeader: React.CSSProperties = {
  backgroundColor: '#162e24',
  color: '#ffffff',
  fontSize: '0.7rem',
  fontWeight: '700',
  textAlign: 'center',
  padding: '0.5rem',
  borderBottom: '1px solid #1f352e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ticketBody: React.CSSProperties = {
  padding: '1.2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const badgeStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: '700',
  color: '#10b981',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  padding: '2px 8px',
  borderRadius: '20px',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  marginBottom: '0.8rem',
};

const qrBoxStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  padding: '8px',
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '1rem',
};

const qrImageStyle: React.CSSProperties = {
  width: '120px',
  height: '120px',
};

const codeText: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: '#000000',
  marginTop: '4px',
  fontFamily: 'monospace',
};

const ticketDivider: React.CSSProperties = {
  width: '100%',
  borderTop: '1px dashed #1f352e',
  margin: '0.8rem 0',
};

const infoRowStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
  fontSize: '0.75rem',
};

const infoLabel: React.CSSProperties = {
  color: 'var(--text-secondary)',
};

const infoVal: React.CSSProperties = {
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const ticketFooter: React.CSSProperties = {
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-secondary)',
  fontSize: '0.65rem',
  textAlign: 'center',
  padding: '0.6rem 0.8rem',
  lineHeight: '1.4',
  borderTop: '1px solid #1f352e',
};

const btnBackStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  padding: '0.5rem 1rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const footerStyle: React.CSSProperties = {
  marginTop: '1.5rem',
  textAlign: 'center',
  fontSize: '0.6rem',
  color: 'var(--text-muted)',
};
