import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import type { Attendee } from '../types';
import { UserPlus, Printer, AlertCircle, Globe } from 'lucide-react';

interface OnsiteRegisterProps {
  onPrintTrigger: (attendee: Attendee) => void;
}

export const OnsiteRegister: React.FC<OnsiteRegisterProps> = ({ onPrintTrigger }) => {
  const { addAttendee, deskId } = useAttendees();
  
  const [nationality, setNationality] = useState<'Domestic' | 'Foreign'>('Domestic');
  const [type, setType] = useState('Participant');
  const [nameEn, setNameEn] = useState('');
  const [nameKr, setNameKr] = useState('');
  const [positionEn, setPositionEn] = useState('');
  const [positionKr, setPositionKr] = useState('');
  const [organizationEn, setOrganizationEn] = useState('');
  const [organizationKr, setOrganizationKr] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (nationality === 'Domestic' && !nameKr.trim() && !nameEn.trim()) {
      alert('내국인 참가자의 이름을 입력해 주세요.');
      return;
    }

    if (nationality === 'Foreign' && !nameEn.trim()) {
      alert('외국인 참가자의 영문 이름(English Name)을 입력해 주세요.');
      return;
    }

    const isForeign = nationality === 'Foreign';

    const primaryName = !isForeign && nameEn.trim() && nameKr.trim() 
      ? `${nameEn.trim()} (${nameKr.trim()})` 
      : (nameEn.trim() || nameKr.trim());

    const primaryPosition = !isForeign && positionEn.trim() && positionKr.trim()
      ? `${positionEn.trim()} / ${positionKr.trim()}`
      : (positionEn.trim() || positionKr.trim());

    const primaryOrg = !isForeign && organizationEn.trim() && organizationKr.trim()
      ? `${organizationEn.trim()} / ${organizationKr.trim()}`
      : (organizationEn.trim() || organizationKr.trim());

    const newAttendee = addAttendee({
      nationality: nationality,
      type: type,
      name: primaryName,
      nameEn: nameEn.trim() || undefined,
      nameKr: !isForeign && nameKr.trim() ? nameKr.trim() : undefined,
      position: primaryPosition,
      positionEn: positionEn.trim() || undefined,
      positionKr: !isForeign && positionKr.trim() ? positionKr.trim() : undefined,
      organization: primaryOrg,
      organizationEn: organizationEn.trim() || undefined,
      organizationKr: !isForeign && organizationKr.trim() ? organizationKr.trim() : undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      privacyAgree: phone.trim() || email.trim() ? true : undefined,
      registeredType: '현장',
      isAttended: true,
      printedCount: 1,
      printedBy: deskId
    });

    onPrintTrigger(newAttendee);

    setNameEn('');
    setNameKr('');
    setPositionEn('');
    setPositionKr('');
    setOrganizationEn('');
    setOrganizationKr('');
    setPhone('');
    setEmail('');

    alert(`[현장 등록 성공] ${newAttendee.name} (${nationality === 'Foreign' ? '외국인 명찰 뷰' : '내국인 듀얼 뷰'}) 인쇄가 전송되었습니다.`);
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      <div className="glass" style={formCardStyle}>
        <div style={panelHeaderStyle}>
          <UserPlus size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={panelTitleStyle}>현장 즉석 등록 데스크</h2>
        </div>

        <p style={descStyle}>
          내국인(영문+국문 듀얼) / 외국인(영문 전용 초대형) 구분을 선택하여 90x80mm 라벨 명찰을 자동 인쇄합니다.
        </p>

        {/* 내국인 / 외국인 선택 탭 버튼 */}
        <div style={nationalityToggleWrapper}>
          <button
            type="button"
            style={{
              ...nationalityBtn,
              backgroundColor: nationality === 'Domestic' ? 'var(--accent)' : 'transparent',
              color: nationality === 'Domestic' ? '#ffffff' : 'var(--text-secondary)',
            }}
            onClick={() => setNationality('Domestic')}
          >
            🇰🇷 내국인 (Domestic)
          </button>
          <button
            type="button"
            style={{
              ...nationalityBtn,
              backgroundColor: nationality === 'Foreign' ? 'var(--accent)' : 'transparent',
              color: nationality === 'Foreign' ? '#ffffff' : 'var(--text-secondary)',
            }}
            onClick={() => setNationality('Foreign')}
          >
            <Globe size={14} style={{ marginRight: '4px' }} />
            🌐 외국인 (Foreign)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* 구분 선택 (영어) */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>참가자 구분 (Category)</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={selectStyle}
            >
              <option value="Participant">Participant (일반 참가자)</option>
              <option value="Organizer">Organizer (주최자/기획자)</option>
              <option value="VIP">VIP (주요 인사)</option>
              <option value="Speaker">Speaker (연사)</option>
              <option value="Staff">Staff (운영 요원)</option>
              <option value="Press">Press (취재 기자)</option>
            </select>
          </div>

          {/* 1. 이름 (내국인: 영문+국문, 외국인: 영문 전용) */}
          {nationality === 'Domestic' ? (
            <div style={gridRowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>1-1. 영문이름 (English Name)</label>
                <input 
                  type="text" 
                  placeholder="Gildong Hong (또는 Hong Gildong)" 
                  value={nameEn} 
                  onChange={(e) => setNameEn(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>1-2. 국문이름 (Korean Name)</label>
                <input 
                  type="text" 
                  placeholder="홍길동" 
                  value={nameKr} 
                  onChange={(e) => setNameKr(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>
          ) : (
            <div style={formGroupStyle}>
              <label style={labelStyle}>1. 영문성명 (Full English Name) *필수*</label>
              <input 
                type="text" 
                placeholder="John Doe (또는 Jane Doe)" 
                value={nameEn} 
                onChange={(e) => setNameEn(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          )}

          {/* 2. 직급 */}
          {nationality === 'Domestic' ? (
            <div style={gridRowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>2-1. 영문직급 (English Title)</label>
                <input 
                  type="text" 
                  placeholder="Manager / Team Lead" 
                  value={positionEn} 
                  onChange={(e) => setPositionEn(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>2-2. 국문직급 (Korean Title)</label>
                <input 
                  type="text" 
                  placeholder="팀장 / 매니저" 
                  value={positionKr} 
                  onChange={(e) => setPositionKr(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          ) : (
            <div style={formGroupStyle}>
              <label style={labelStyle}>2. 영문직급 (English Title)</label>
              <input 
                type="text" 
                placeholder="Managing Director / CEO" 
                value={positionEn} 
                onChange={(e) => setPositionEn(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {/* 3. 소속 */}
          {nationality === 'Domestic' ? (
            <div style={gridRowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>3-1. 영문소속 (English Org)</label>
                <input 
                  type="text" 
                  placeholder="Global MICE Corp" 
                  value={organizationEn} 
                  onChange={(e) => setOrganizationEn(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>3-2. 국문소속 (Korean Org)</label>
                <input 
                  type="text" 
                  placeholder="한국컨벤션센터" 
                  value={organizationKr} 
                  onChange={(e) => setOrganizationKr(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          ) : (
            <div style={formGroupStyle}>
              <label style={labelStyle}>3. 영문소속 (English Organization)</label>
              <input 
                type="text" 
                placeholder="World Event Federation" 
                value={organizationEn} 
                onChange={(e) => setOrganizationEn(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {/* 연락처 / 이메일 */}
          <div style={gridRowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>연락처 (Phone)</label>
              <input 
                type="tel" 
                placeholder="010-0000-0000" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>이메일 (Email)</label>
              <input 
                type="email" 
                placeholder="user@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={warningBoxStyle}>
            <AlertCircle size={14} style={{ color: 'var(--mint)', marginRight: '6px', flexShrink: 0 }} />
            <span>
              {nationality === 'Foreign' 
                ? '외국인 옵션: 국문 입력 없이 초대형 영문 전용 명찰 뷰로 출력됩니다.' 
                : '내국인 옵션: 영문+국문 듀얼 명찰 뷰로 출력됩니다.'}
            </span>
          </div>

          <button type="submit" style={btnSubmitStyle}>
            <Printer size={16} style={{ marginRight: '6px' }} />
            현장 등록 및 즉시 인쇄
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '1rem 0',
};

const formCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '560px',
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
  fontSize: '1rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const descStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.5',
  marginBottom: '1.2rem',
};

const nationalityToggleWrapper: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.5rem',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  padding: '0.3rem',
  borderRadius: '8px',
  marginBottom: '1.2rem',
};

const nationalityBtn: React.CSSProperties = {
  padding: '0.6rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  borderRadius: '6px',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
};

const gridRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
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
};

const inputStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  padding: '0.6rem 0.75rem',
};

const warningBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'var(--mint-light)',
  border: '1px solid rgba(52, 211, 153, 0.2)',
  padding: '0.6rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  color: 'var(--mint)',
  lineHeight: '1.4',
};

const btnSubmitStyle: React.CSSProperties = {
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  padding: '0.8rem',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontWeight: '700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '0.5rem',
};
