import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type { Attendee } from '../types';
import { useAttendees } from '../context/AttendeeContext';

interface IdCardTemplateProps {
  attendee: Attendee | null;
}

// [내국인 뷰] 글자 길이에 따른 영문이름 폰트 크기
const getDomesticNameEnFontSize = (text: string, scale: number) => {
  const len = text.length;
  let base = 28;
  if (len <= 10) base = 28;
  else if (len <= 14) base = 24;
  else if (len <= 18) base = 20;
  else base = 16;
  return `${base * scale}pt`;
};

// [외국인 전용 뷰] 공간을 최대로 활용하는 초대형 영문이름 폰트 크기
const getForeignNameEnFontSize = (text: string, scale: number) => {
  const len = text.length;
  let base = 38;
  if (len <= 10) base = 38;
  else if (len <= 14) base = 30;
  else if (len <= 18) base = 25;
  else base = 20;
  return `${base * scale}pt`;
};

// 국문이름 폰트 크기
const getNameKrFontSize = (text: string, scale: number) => {
  const len = text.length;
  let base = 22;
  if (len <= 4) base = 22;
  else if (len <= 7) base = 18;
  else base = 14;
  return `${base * scale}pt`;
};

// 소속 폰트 크기
const getOrgFontSize = (text: string, isForeign: boolean, scale: number) => {
  const len = text.length;
  let base = isForeign ? 15 : 13;
  if (len <= 15) base = isForeign ? 15 : 13;
  else if (len <= 25) base = isForeign ? 12.5 : 11;
  else base = isForeign ? 10.5 : 9.5;
  return `${base * scale}pt`;
};

export const IdCardTemplate: React.FC<IdCardTemplateProps> = ({ attendee }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  let settings = { pageWidth: 90, pageHeight: 80 };
  try {
    const context = useAttendees();
    if (context && context.settings) {
      settings = context.settings;
    }
  } catch (e) {
    // context 외 단독 렌더링 예외 처리
  }

  // 오프라인 로컬 Base64 DataURL 생성 (인쇄 시 100% 로딩 보장)
  useEffect(() => {
    if (attendee?.code) {
      QRCode.toDataURL(
        attendee.code,
        { margin: 1, width: 200, color: { dark: '#000000', light: '#ffffff' } },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [attendee?.code]);

  if (!attendee) return null;

  // 90mm x 80mm 기준 비율 스케일링
  const scale = Math.min(settings.pageWidth / 90, settings.pageHeight / 80);

  // 영문/국문 세부 정보 추출
  const nameEn = attendee.nameEn || (attendee.name.includes('(') ? attendee.name.split('(')[0].trim() : attendee.name);
  const nameKr = attendee.nameKr || (attendee.name.includes('(') ? attendee.name.split('(')[1].replace(')', '').trim() : '');

  const positionEn = attendee.positionEn || (attendee.position?.includes('/') ? attendee.position.split('/')[0].trim() : (attendee.position || ''));
  const positionKr = attendee.positionKr || (attendee.position?.includes('/') ? attendee.position.split('/')[1].trim() : '');

  const orgEn = attendee.organizationEn || (attendee.organization?.includes('/') ? attendee.organization.split('/')[0].trim() : (attendee.organization || ''));
  const orgKr = attendee.organizationKr || (attendee.organization?.includes('/') ? attendee.organization.split('/')[1].trim() : '');

  // 내국인/외국인 판별 (설정된 nationality가 없으면 국문이름 존재 여부로 자동 판별)
  const isForeign = attendee.nationality === 'Foreign' || (!attendee.nationality && !nameKr);

  // 감열식 라벨 흑백 인쇄 카드 스타일 (Pretendard & 중앙 정렬)
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    color: '#000000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden',
    padding: `${5 * scale}mm ${5 * scale}mm ${4 * scale}mm ${5 * scale}mm`,
    border: `${1 * scale}px solid #111111`,
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif",
  };

  // 하단 스캔용 QR 코드 및 발급넘버 세로 수직 배치
  const footerScanContainer: React.CSSProperties = {
    position: 'absolute',
    bottom: `${2 * scale}mm`,
    right: `${3.5 * scale}mm`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${0.5 * scale}mm`,
  };

  const codeTextStyle: React.CSSProperties = {
    fontSize: `${6.5 * scale}pt`,
    fontWeight: 700,
    color: '#000000',
    fontFamily: "'Outfit', monospace",
    letterSpacing: `${0.5 * scale}px`,
    lineHeight: 1,
  };

  const qrImageStyle: React.CSSProperties = {
    width: `${12 * scale}mm`,
    height: `${12 * scale}mm`,
    objectFit: 'contain',
  };

  // ==========================================
  // 🅰️ [외국인 전용 레이아웃 엔진 (Foreign Mode)]
  // ==========================================
  if (isForeign) {
    const foreignNameStyle: React.CSSProperties = {
      fontSize: getForeignNameEnFontSize(nameEn, scale),
      fontWeight: 900,
      color: '#000000',
      lineHeight: 1.05,
      letterSpacing: `${-0.5 * scale}px`,
      wordBreak: 'keep-all',
      marginTop: `${3 * scale}mm`,
    };

    const foreignPositionStyle: React.CSSProperties = {
      fontSize: `${14 * scale}pt`,
      fontWeight: 700,
      color: '#111111',
      lineHeight: 1.2,
      margin: `${2 * scale}mm 0 ${1 * scale}mm 0`,
    };

    const foreignOrgStyle: React.CSSProperties = {
      fontSize: getOrgFontSize(orgEn, true, scale),
      fontWeight: 700,
      color: '#000000',
      lineHeight: 1.2,
      wordBreak: 'keep-all',
      marginBottom: `${2 * scale}mm`,
    };

    const foreignCategoryStyle: React.CSSProperties = {
      fontSize: `${17 * scale}pt`,
      fontWeight: 900,
      color: '#000000',
      lineHeight: 1.1,
      letterSpacing: `${-0.3 * scale}px`,
      marginBottom: `${1 * scale}mm`,
    };

    return (
      <div style={cardStyle}>
        {/* 초대형 영문 이름 */}
        <div style={foreignNameStyle}>{nameEn}</div>

        {/* 영문 직급 */}
        {positionEn && <div style={foreignPositionStyle}>{positionEn}</div>}

        {/* 영문 소속 */}
        {orgEn && <div style={foreignOrgStyle}>{orgEn}</div>}

        {/* 참가자 구분 */}
        <div style={foreignCategoryStyle}>{attendee.type}</div>

        {/* QR & 코드 */}
        <div style={footerScanContainer}>
          {qrDataUrl && <img src={qrDataUrl} alt={`QR ${attendee.code}`} style={qrImageStyle} />}
          <span style={codeTextStyle}>{attendee.code}</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🅱️ [내국인 전용 듀얼 레이아웃 엔진 (Domestic Mode)]
  // ==========================================
  const domesticNameBlock: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${1 * scale}mm`,
    marginTop: `${1 * scale}mm`,
    width: '100%',
  };

  const domesticNameEnStyle: React.CSSProperties = {
    fontSize: getDomesticNameEnFontSize(nameEn, scale),
    fontWeight: 900,
    color: '#000000',
    lineHeight: 1.05,
    letterSpacing: `${-0.5 * scale}px`,
    wordBreak: 'keep-all',
  };

  const domesticNameKrStyle: React.CSSProperties = {
    fontSize: getNameKrFontSize(nameKr, scale),
    fontWeight: 850,
    color: '#000000',
    lineHeight: 1.15,
    wordBreak: 'keep-all',
  };

  const domesticPosBlock: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${0.5 * scale}mm`,
    margin: `${1 * scale}mm 0`,
    width: '100%',
  };

  const domesticOrgBlock: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${0.5 * scale}mm`,
    margin: `${1 * scale}mm 0`,
    width: '100%',
  };

  const domesticCategoryStyle: React.CSSProperties = {
    fontSize: `${15 * scale}pt`,
    fontWeight: 900,
    color: '#000000',
    lineHeight: 1.1,
    letterSpacing: `${-0.3 * scale}px`,
    marginTop: `${1 * scale}mm`,
    marginBottom: `${1 * scale}mm`,
  };

  return (
    <div style={cardStyle}>
      {/* 1-1. 영문이름 & 1-2. 국문이름 */}
      <div style={domesticNameBlock}>
        <div style={domesticNameEnStyle}>{nameEn}</div>
        {nameKr && <div style={domesticNameKrStyle}>{nameKr}</div>}
      </div>

      {/* 2-1. 영문직급 & 2-2. 국문직급 */}
      {(positionEn || positionKr) && (
        <div style={domesticPosBlock}>
          {positionEn && <div style={{ fontSize: `${12 * scale}pt`, fontWeight: 700, color: '#111111' }}>{positionEn}</div>}
          {positionKr && <div style={{ fontSize: `${11 * scale}pt`, fontWeight: 600, color: '#222222' }}>{positionKr}</div>}
        </div>
      )}

      {/* 3-1. 영문소속 & 3-2. 국문소속 */}
      {(orgEn || orgKr) && (
        <div style={domesticOrgBlock}>
          {orgEn && <div style={{ fontSize: getOrgFontSize(orgEn, false, scale), fontWeight: 700, color: '#111111' }}>{orgEn}</div>}
          {orgKr && <div style={{ fontSize: getOrgFontSize(orgKr, false, scale), fontWeight: 700, color: '#000000' }}>{orgKr}</div>}
        </div>
      )}

      {/* 4. 참가자 구분 */}
      <div style={domesticCategoryStyle}>{attendee.type}</div>

      {/* QR & 코드 */}
      <div style={footerScanContainer}>
        {qrDataUrl && <img src={qrDataUrl} alt={`QR ${attendee.code}`} style={qrImageStyle} />}
        <span style={codeTextStyle}>{attendee.code}</span>
      </div>
    </div>
  );
};
