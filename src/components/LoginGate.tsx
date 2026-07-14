import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import { Lock, Sparkles, AlertCircle } from 'lucide-react';

export const LoginGate: React.FC = () => {
  const { login } = useAttendees();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const success = login(password);
    if (success) {
      setPassword('');
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };

  return (
    <div style={viewportStyle}>
      <div 
        className={`glass glow ${isShaking ? 'shake-animation' : ''}`}
        style={containerStyle}
      >
        <div style={headerStyle}>
          <div style={logoIconBox}>
            <Lock size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h1 style={titleStyle}>GOYANG DESTINATION WEEK 2026</h1>
          <p style={subtitleStyle}>명찰 인쇄 및 현장 입장 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>시스템 보안 인증</label>
            <input 
              type="password" 
              placeholder="데스크 비밀번호를 입력하세요" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(false);
              }}
              style={{
                ...inputStyle,
                borderColor: error ? '#f87171' : 'var(--border)',
                boxShadow: error ? '0 0 10px rgba(239, 68, 68, 0.1)' : 'none'
              }}
              autoFocus
              required
            />
          </div>

          {error && (
            <div style={errorStyle}>
              <AlertCircle size={14} style={{ marginRight: '6px' }} />
              <span>올바르지 않은 인증 비밀번호입니다.</span>
            </div>
          )}

          <button type="submit" style={btnSubmitStyle}>
            <Sparkles size={16} style={{ marginRight: '6px' }} />
            보안 로그인
          </button>
        </form>

        <div style={hintCardStyle}>
          <div style={hintTitle}>💡 데모 로그인 가이드 (비밀번호 입력 시 자동 인식)</div>
          <ul style={hintList}>
            <li><strong>데스크 01</strong>: <code style={codeStyle}>gdw2026d1</code></li>
            <li><strong>데스크 02</strong>: <code style={codeStyle}>gdw2026d2</code></li>
            <li><strong>데스크 03</strong>: <code style={codeStyle}>gdw2026d3</code></li>
            <li><strong>데스크 04</strong>: <code style={codeStyle}>gdw2026d4</code></li>
            <li><strong>마스터 관리자 (전체)</strong>: <code style={codeStyle}>gdw2026admin</code></li>
          </ul>
        </div>

        <div style={footerStyle}>
          © 2026 Goyang Destination Week. All rights reserved.
        </div>
      </div>

      <style>{`
        .shake-animation {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
      `}</style>
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
  padding: '1.5rem',
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  borderRadius: '16px',
  padding: '2.5rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  marginBottom: '2rem',
};

const logoIconBox: React.CSSProperties = {
  backgroundColor: 'var(--accent-light)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  padding: '1rem',
  borderRadius: '50%',
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.1)',
};

const titleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '800',
  letterSpacing: '0.5px',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-title)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  marginTop: '4px',
};

const formStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
};

const inputStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  padding: '0.75rem 1rem',
  textAlign: 'center',
  letterSpacing: '2px',
};

const errorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.72rem',
  color: '#f87171',
  backgroundColor: 'rgba(239, 68, 68, 0.05)',
  border: '1px solid rgba(239, 68, 68, 0.15)',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  justifyContent: 'center',
};

const btnSubmitStyle: React.CSSProperties = {
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  padding: '0.75rem',
  fontSize: '0.85rem',
  fontWeight: '700',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '0.4rem',
  cursor: 'pointer',
};

const hintCardStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '2rem',
  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  border: '1px dashed var(--border)',
  padding: '0.85rem',
  borderRadius: '8px',
};

const hintTitle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  marginBottom: '0.5rem',
};

const hintList: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  fontSize: '0.68rem',
  color: 'var(--text-muted)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.3rem',
};

const codeStyle: React.CSSProperties = {
  color: 'var(--mint)',
  fontFamily: 'monospace',
  fontWeight: '600',
  backgroundColor: 'rgba(52, 211, 153, 0.05)',
  padding: '1px 4px',
  borderRadius: '3px',
};

const footerStyle: React.CSSProperties = {
  marginTop: '2rem',
  fontSize: '0.6rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
};
