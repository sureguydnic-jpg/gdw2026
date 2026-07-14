export interface Attendee {
  id: string;              // 고유 ID
  code: string;            // 등록코드 (QR/바코드 인식용 5~6자리 숫자)
  type: string;            // 참가자 구분 (VIP, 일반, 스태프, 기자, 연사 등)
  organization: string;    // 소속
  position: string;        // 직책
  name: string;            // 이름
  phone?: string;          // 연락처 (추가)
  email?: string;          // 이메일 (추가)
  privacyAgree?: boolean;  // 개인정보 수집 동의 여부 (추가)
  isAttended: boolean;     // 참석 여부 (ID카드 출력 시 true)
  attendedAt?: string;     // 참석(출력) 일시
  registeredType: '사전' | '현장'; // 등록 구분
  printedCount: number;    // ID카드 인쇄 횟수
  printedBy?: string;      // 인쇄 처리한 데스크 ID (예: Desk-01, Desk-02 등)
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
