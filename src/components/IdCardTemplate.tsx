import React from 'react';
import type { Attendee } from '../types';
import { useAttendees } from '../context/AttendeeContext';

interface IdCardTemplateProps {
  attendee: Attendee | null;
}

// 글자 길이에 따른 이름 폰트 크기 동적 조절 (외국인 긴 이름 대응)
const getNameFontSize = (name: string, scale: number) => {
  const len = name.length;
  const isEnglish = /^[a-zA-Z\s,.-]+$/.test(name);
  let base = 18;
  if (isEnglish) {
    if (len <= 10) base = 16;
    else if (len <= 14) base = 13;
    else if (len <= 18) base = 10.5;
    else base = 8.5;
  } else {
    if (len <= 4) base = 18;
    else if (len <= 6) base = 14;
    else if (len <= 8) base = 11.5;
    else base = 9.5;
  }
  return `${base * scale}pt`;
};

// 글자 길이에 따른 소속 폰트 크기 동적 조절
const getOrgFontSize = (org: string, scale: number) => {
  const len = org.length;
  let base = 8.5;
  if (len <= 15) base = 8.5;
  else if (len <= 25) base = 7.5;
  else base = 6.5;
  return `${base * scale}pt`;
};

export const IdCardTemplate: React.FC<IdCardTemplateProps> = ({ attendee }) => {
  if (!attendee) return null;

  // Context에서 설정값(pageWidth, pageHeight)을 가져와 기준 해상도(80x50mm) 대비 스케일 계산
  let settings = { pageWidth: 80, pageHeight: 50 };
  try {
    const context = useAttendees();
    if (context && context.settings) {
      settings = context.settings;
    }
  } catch (e) {
    // context 바깥에서 단독 렌더링될 경우 대비 예외 처리
  }

  // 가로세로 비율을 최대한 해치지 않으며 스케일링
  const scale = Math.min(settings.pageWidth / 80, settings.pageHeight / 50);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VIP': return '#fbbf24'; // Gold
      case '연사': return '#8b5cf6'; // Purple
      case '스태프': return '#ef4444'; // Red
      case '기자': return '#06b6d4'; // Teal
      default: return '#3b82f6'; // Blue
    }
  };

  const typeColor = getTypeColor(attendee.type);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${attendee.code}`;

  // 스케일이 반영된 동적 스타일 선언
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    color: '#000000',
    display: 'flex',
    flexDirection: 'row',
    boxSizing: 'border-box',
    overflow: 'hidden',
    border: `${1 * scale}px solid #e5e7eb`,
    fontFamily: "'Noto Sans KR', 'Malgun Gothic', sans-serif",
  };

  const sidebarStyle: React.CSSProperties = {
    width: `${5 * scale}mm`,
    height: '100%',
    backgroundColor: typeColor,
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: `${3 * scale}mm ${2 * scale}mm ${3 * scale}mm ${3 * scale}mm`,
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    borderBottom: `${0.3 * scale}mm solid #e5e7eb`,
    paddingBottom: `${1 * scale}mm`,
  };

  const titleText: React.CSSProperties = {
    fontSize: `${6.5 * scale}pt`,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: `${0.2 * scale}px`,
    lineHeight: '1.2',
    fontFamily: "'Outfit', sans-serif",
  };

  const subtitleText: React.CSSProperties = {
    fontSize: `${5.5 * scale}pt`,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: `${0.5 * scale}mm`,
  };

  const bodyStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: `${1 * scale}mm 0`,
  };

  const orgTextStyle: React.CSSProperties = {
    fontSize: getOrgFontSize(attendee.organization, scale),
    fontWeight: '500',
    color: '#4b5563',
    whiteSpace: 'normal',
    wordBreak: 'keep-all',
    lineHeight: '1.25',
    marginBottom: `${1.2 * scale}mm`,
  };

  const nameRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: `${0.6 * scale}mm`,
  };

  const nameTextStyle: React.CSSProperties = {
    fontSize: getNameFontSize(attendee.name, scale),
    fontWeight: '700',
    color: '#000000',
    letterSpacing: `${-0.5 * scale}px`,
    whiteSpace: 'normal',
    wordBreak: 'keep-all',
    lineHeight: '1.15',
  };

  const positionTextStyle: React.CSSProperties = {
    fontSize: `${9 * scale}pt`,
    fontWeight: '600',
    color: '#374151',
    whiteSpace: 'normal',
    wordBreak: 'keep-all',
    lineHeight: '1.2',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: `${0.3 * scale}mm dashed #d1d5db`,
    paddingTop: `${1.5 * scale}mm`,
  };

  const badgeTypeBoxStyle = (color: string): React.CSSProperties => ({
    fontSize: `${7.5 * scale}pt`,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: color,
    padding: `${0.5 * scale}mm ${2.5 * scale}mm`,
    borderRadius: `${0.5 * scale}mm`,
    textAlign: 'center',
    textTransform: 'uppercase',
  });

  const codeStyleContainer: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };

  const codeLabel: React.CSSProperties = {
    fontSize: `${4.5 * scale}pt`,
    fontWeight: '600',
    color: '#9ca3af',
  };

  const codeText: React.CSSProperties = {
    fontSize: `${8 * scale}pt`,
    fontWeight: '700',
    color: '#111827',
    fontFamily: "'Outfit', monospace",
    letterSpacing: `${0.5 * scale}px`,
  };

  const qrContainerStyle: React.CSSProperties = {
    width: `${18 * scale}mm`,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: `${3 * scale}mm`,
    flexShrink: 0,
  };

  const qrImageStyle: React.CSSProperties = {
    width: `${14 * scale}mm`,
    height: `${14 * scale}mm`,
    objectFit: 'contain',
  };

  return (
    <div style={cardStyle}>
      <div style={sidebarStyle} />
      <div style={contentStyle}>
        <div style={headerStyle}>
          <div style={titleText}>GOYANG DESTINATION WEEK 2026</div>
          <div style={subtitleText}>고양 데스티네이션 위크 2026</div>
        </div>
        <div style={bodyStyle}>
          <div style={orgTextStyle}>
            {attendee.organization}
          </div>
          <div style={nameRowStyle}>
            <span style={nameTextStyle}>
              {attendee.name}
            </span>
            <span style={positionTextStyle}>{attendee.position}</span>
          </div>
        </div>
        <div style={footerStyle}>
          <div style={badgeTypeBoxStyle(typeColor)}>
            {attendee.type}
          </div>
          <div style={codeStyleContainer}>
            <span style={codeLabel}>REG-CODE</span>
            <span style={codeText}>{attendee.code}</span>
          </div>
        </div>
      </div>
      <div style={qrContainerStyle}>
        <img 
          src={qrUrl} 
          alt={`QR ${attendee.code}`} 
          style={qrImageStyle}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
};
