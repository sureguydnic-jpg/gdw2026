import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import type { Attendee } from '../types';
import { UserPlus, Printer, AlertCircle } from 'lucide-react';

interface OnsiteRegisterProps {
  onPrintTrigger: (attendee: Attendee) => void;
}

export const OnsiteRegister: React.FC<OnsiteRegisterProps> = ({ onPrintTrigger }) => {
  const { addAttendee, printAttendee } = useAttendees();
  
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [position, setPosition] = useState('');
  const [type, setType] = useState('일반');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !organization.trim() || !position.trim()) {
      alert('필수 정보(이름, 소속, 직책)를 모두 입력해 주세요.');
      return;
    }

    // 1. 현장 등록 데이터 생성 (연락처, 이메일 포함)
    const newAttendee = addAttendee({
      name: name.trim(),
      organization: organization.trim(),
      position: position.trim(),
      type: type,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      privacyAgree: phone.trim() || email.trim() ? true : undefined,
      registeredType: '현장' // 명시적 현장 지정
    });

    // 2. 즉시 명찰 출력 트리거 및 입장/참석 처리
    printAttendee(newAttendee.id);
    onPrintTrigger(newAttendee);

    // 3. 입력 필드 초기화 (구분은 '일반' 유지)
    setName('');
    setOrganization('');
    setPosition('');
    setPhone('');
    setEmail('');

    alert(`[현장 등록 성공] ${newAttendee.name} 님의 데이터가 등록되었으며, 명찰 인쇄 작업이 전송되었습니다.`);
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      <div className="glass" style={formCardStyle}>
        
        {/* 헤더 */}
        <div style={panelHeaderStyle}>
          <UserPlus size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={panelTitleStyle}>현장 즉석 등록 데스크</h2>
        </div>

        <p style={descStyle}>
          사전등록이 안 된 현장 방문 참가자의 정보를 입력하고 등록 즉시 바코드 프린터로 명찰을 발급합니다.
        </p>

        {/* 폼 */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* 구분 선택 */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>참가자 구분</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              style={selectStyle}
            >
              <option value="일반">일반 참가자</option>
              <option value="VIP">VIP</option>
              <option value="연사">연사 (Speaker)</option>
              <option value="스태프">스태프 (Staff)</option>
              <option value="기자">기자 (Press)</option>
            </select>
          </div>

          {/* 이름 */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>이름</label>
            <input 
              type="text" 
              placeholder="예: 홍길동 (또는 영문명)" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* 소속 */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>소속 기관/회사</label>
            <input 
              type="text" 
              placeholder="예: 고양컨벤션뷰로" 
              value={organization} 
              onChange={(e) => setOrganization(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* 직책 */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>직책</label>
            <input 
              type="text" 
              placeholder="예: 과장, 연구원, 대표 등" 
              value={position} 
              onChange={(e) => setPosition(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {/* 연락처 (옵션) */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>연락처 (선택)</label>
            <input 
              type="tel" 
              placeholder="예: 010-1234-5678" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 이메일 (옵션) */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>이메일 주소 (선택)</label>
            <input 
              type="email" 
              placeholder="example@gdw.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={warningBoxStyle}>
            <AlertCircle size={14} style={{ color: 'var(--mint)', marginRight: '6px', flexShrink: 0 }} />
            <span>등록 완료 버튼을 누르는 즉시 브라우저 인쇄 화면이 실행됩니다.</span>
          </div>

          {/* 등록 및 인쇄 버튼 */}
          <button type="submit" style={btnSubmitStyle}>
            <Printer size={16} style={{ marginRight: '6px' }} />
            현장 등록 및 즉시 인쇄
          </button>
        </form>
      </div>
    </div>
  );
};

/* ==========================================
   CSS IN JS (OnsiteRegister UI)
   ========================================== */
const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '1rem 0',
};

const formCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
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
  marginBottom: '1.5rem',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
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
