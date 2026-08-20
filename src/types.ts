export interface Attendee {
  id: string;              // 고유 ID
  code: string;            // 등록코드 (QR/바코드 인식용 5~6자리 숫자)
  type: string;            // 참가자 구분 (Organizer, VIP, Speaker, Participant, Staff, Press 등)
  nationality?: 'Domestic' | 'Foreign'; // 내국인(Domestic) | 외국인(Foreign)
  name: string;            // 대표/통합 이름
  nameEn?: string;         // 영문이름 (1-1)
  nameKr?: string;         // 국문이름 (1-2)
  position: string;        // 대표/통합 직책
  positionEn?: string;     // 영문직급 (2-1)
  positionKr?: string;     // 국문직급 (2-2)
  organization: string;    // 대표/통합 소속
  organizationEn?: string; // 영문소속 (3-1)
  organizationKr?: string; // 국문소속 (3-2)
  phone?: string;          // 연락처
  email?: string;          // 이메일
  privacyAgree?: boolean;  // 개인정보 수집 동의 여부
  isAttended: boolean;     // 참석 여부 (ID카드 출력 시 true)
  attendedAt?: string;     // 참석(출력) 일시
  registeredType: '사전' | '현장'; // 등록 구분
  printedCount: number;    // ID카드 인쇄 횟수
  printedBy?: string;      // 인쇄 처리한 데스크 ID
}

export interface PrintLog {
  id: string;
  attendeeId: string;
  name: string;
  organization: string;
  type: string;
  printedAt: string;
  deskId: string;
  registeredType: '사전' | '현장';
}

export interface PrintSettings {
  pageWidth: number;  // mm 단위
  pageHeight: number; // mm 단위
}

export interface PreQna {
  id: string;
  name: string;
  organization: string;
  question: string;
  createdAt: string;
  isReviewed: boolean;
}

export interface PreSurvey {
  id: string;
  name?: string;
  organization?: string;
  rating: number;
  satisfaction: string;
  interestAreas: string[];
  suggestions: string;
  createdAt: string;
}

