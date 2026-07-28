import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import { 
  Globe, 
  BookOpen, 
  MessageSquare, 
  ClipboardList, 
  ArrowLeft, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Calendar 
} from 'lucide-react';

export const MobilePortal: React.FC = () => {
  const { addPreQna, addPreSurvey } = useAttendees();
  const [activeView, setActiveView] = useState<'portal' | 'qna' | 'survey'>('portal');

  // Q&A Form State
  const [qnaName, setQnaName] = useState('');
  const [qnaOrg, setQnaOrg] = useState('');
  const [qnaQuestion, setQnaQuestion] = useState('');
  const [qnaSubmitted, setQnaSubmitted] = useState(false);

  // Survey Form State
  const [surveyName, setSurveyName] = useState('');
  const [surveyOrg, setSurveyOrg] = useState('');
  const [surveyRating, setSurveyRating] = useState(5);
  const [surveySatisfaction, setSurveySatisfaction] = useState('매우 만족');
  const [surveyInterests, setSurveyInterests] = useState<string[]>([]);
  const [surveySuggestions, setSurveySuggestions] = useState('');
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const interestOptions = [
    'MICE 트렌드',
    '데스티네이션 마케팅',
    'IT & 테크 융합',
    '글로벌 네트워킹',
    '고양시 관광/MICE 정보'
  ];

  // Q&A Submit Handler
  const handleQnaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qnaName.trim() || !qnaOrg.trim() || !qnaQuestion.trim()) return;

    addPreQna({
      name: qnaName.trim(),
      organization: qnaOrg.trim(),
      question: qnaQuestion.trim()
    });

    setQnaSubmitted(true);
    setTimeout(() => {
      setQnaSubmitted(false);
      setQnaName('');
      setQnaOrg('');
      setQnaQuestion('');
      setActiveView('portal');
    }, 2000);
  };

  // Survey Submit Handler
  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPreSurvey({
      name: surveyName.trim() || undefined,
      organization: surveyOrg.trim() || undefined,
      rating: surveyRating,
      satisfaction: surveySatisfaction,
      interestAreas: surveyInterests,
      suggestions: surveySuggestions.trim()
    });

    setSurveySubmitted(true);
    setTimeout(() => {
      setSurveySubmitted(false);
      setSurveyName('');
      setSurveyOrg('');
      setSurveyRating(5);
      setSurveySatisfaction('매우 만족');
      setSurveyInterests([]);
      setSurveySuggestions('');
      setActiveView('portal');
    }, 2000);
  };

  const handleInterestToggle = (option: string) => {
    setSurveyInterests(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option) 
        : [...prev, option]
    );
  };

  return (
    <div style={containerStyle}>
      {/* 배경 그라데이션 광원 */}
      <div style={bgGlowLeft} />
      <div style={bgGlowRight} />

      {activeView === 'portal' && (
        <div style={innerContainer}>
          {/* 로고 및 행사 타이틀 */}
          <div style={logoWrapper}>
            <div style={sparkleIcon}>
              <Sparkles size={24} color="#34d399" />
            </div>
            <div style={eventSubtitle}>GOYANG DESTINATION WEEK 2026</div>
            <h1 style={eventTitle}>고양 데스티네이션 위크</h1>
          </div>

          {/* 행사 요약 카드 */}
          <div className="glass" style={eventSummaryCard}>
            <div style={summaryRow}>
              <Calendar size={16} color="#34d399" />
              <span style={summaryText}>2026. 08. 26(수) - 08. 29(토)</span>
            </div>
            <div style={{ ...summaryRow, marginTop: '8px' }}>
              <MapPin size={16} color="#34d399" />
              <span style={summaryText}>고양꽃전시장</span>
            </div>
          </div>

          <div style={dividerText}>모바일 주요 바로가기 포털</div>

          {/* 4대 포털 버튼 */}
          <div style={menuGrid}>
            <button 
              className="glass" 
              style={menuBtnStyle}
              onClick={() => window.open('https://www.goyangdestinationweek.com/event/62cf8e72-93b9-42fe-be0e-5158842651e0/Home', '_blank')}
            >
              <div style={{ ...btnIconWrapper, background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)' }}>
                <Globe size={24} color="#ffffff" />
              </div>
              <span style={btnLabelStyle}>Website (공식 웹사이트)</span>
              <span style={btnDescStyle}>행사 개요 및 국/영문 일정 안내</span>
            </button>

            <button 
              className="glass" 
              style={menuBtnStyle}
              onClick={() => window.open('https://goyangdestinationweek.com/ebook', '_blank')}
            >
              <div style={{ ...btnIconWrapper, background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' }}>
                <BookOpen size={24} color="#ffffff" />
              </div>
              <span style={btnLabelStyle}>E-Book (자료집)</span>
              <span style={btnDescStyle}>연사들의 발표자료를 취합한 자료집</span>
            </button>

            <button 
              className="glass" 
              style={menuBtnStyle}
              onClick={() => setActiveView('qna')}
            >
              <div style={{ ...btnIconWrapper, background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }}>
                <MessageSquare size={24} color="#ffffff" />
              </div>
              <span style={btnLabelStyle}>Pre-Q&A (사전 질문)</span>
              <span style={btnDescStyle}>연사에게 궁금한 사항을 사전에 질문</span>
            </button>

            <button 
              className="glass" 
              style={menuBtnStyle}
              onClick={() => setActiveView('survey')}
            >
              <div style={{ ...btnIconWrapper, background: 'linear-gradient(135deg, #34d399 0%, #065f46 100%)' }}>
                <ClipboardList size={24} color="#ffffff" />
              </div>
              <span style={btnLabelStyle}>Survey (설문조사)</span>
              <span style={btnDescStyle}>행사 만족도 평가 및 피드백 작성</span>
            </button>
          </div>

          {/* 푸터 */}
          <footer style={footerStyle}>
            © 2026 Goyang Convention Bureau. All rights reserved.
          </footer>
        </div>
      )}

      {/* 2. Pre-Q&A 사전 질문 모바일 작성 화면 */}
      {activeView === 'qna' && (
        <div style={innerContainer}>
          <div style={formHeader}>
            <button style={backBtnStyle} onClick={() => setActiveView('portal')}>
              <ArrowLeft size={20} />
            </button>
            <span style={formTitleText}>사전 질문 등록 (Pre-Q&A)</span>
            <div style={{ width: '40px' }} /> {/* 우측 빈 공간 밸런스 */}
          </div>

          {qnaSubmitted ? (
            <div className="glass" style={successCard}>
              <CheckCircle2 size={56} color="#34d399" style={{ marginBottom: '16px' }} />
              <h2 style={successTitle}>질문 제출 완료!</h2>
              <p style={successDesc}>소중한 사전 질문이 정상적으로 접수되었습니다.<br />세션 토론 및 Q&A 시간에 답변해 드립니다.</p>
            </div>
          ) : (
            <form onSubmit={handleQnaSubmit} style={formStyle}>
              <div style={formInfoBox}>
                연사 및 발표 주제에 대해 궁금한 사항을 미리 제출해 주세요. 제출된 질문은 행사 당일 Q&A 시간에 연사에게 전달됩니다.
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>이름 *</label>
                <input 
                  type="text" 
                  value={qnaName}
                  onChange={(e) => setQnaName(e.target.value)}
                  placeholder="본인의 성명을 입력해 주세요."
                  required
                  style={inputStyle}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>소속 기관/회사 *</label>
                <input 
                  type="text" 
                  value={qnaOrg}
                  onChange={(e) => setQnaOrg(e.target.value)}
                  placeholder="회사명 또는 학교명을 입력해 주세요."
                  required
                  style={inputStyle}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>질문 내용 *</label>
                <textarea 
                  value={qnaQuestion}
                  onChange={(e) => setQnaQuestion(e.target.value)}
                  placeholder="여기에 질문 내용을 작성해 주세요."
                  required
                  rows={6}
                  style={textareaStyle}
                />
              </div>

              <button type="submit" style={submitBtnStyle('#10b981')}>
                질문 제출하기
              </button>
            </form>
          )}
        </div>
      )}

      {/* 3. Pre-Survey 사전 설문조사 모바일 작성 화면 */}
      {activeView === 'survey' && (
        <div style={innerContainer}>
          <div style={formHeader}>
            <button style={backBtnStyle} onClick={() => setActiveView('portal')}>
              <ArrowLeft size={20} />
            </button>
            <span style={formTitleText}>설문조사 (Survey)</span>
            <div style={{ width: '40px' }} />
          </div>

          {surveySubmitted ? (
            <div className="glass" style={successCard}>
              <CheckCircle2 size={56} color="#34d399" style={{ marginBottom: '16px' }} />
              <h2 style={successTitle}>설문 참여 완료!</h2>
              <p style={successDesc}>소중한 피드백을 전달해 주셔서 대단히 감사합니다.<br />행사 운영 개선의 기초 자료로 활용하겠습니다.</p>
            </div>
          ) : (
            <form onSubmit={handleSurveySubmit} style={formStyle}>
              <div style={formInfoBox}>
                행사 만족도 및 유익했던 세션 분야에 대해 의견을 작성해 주시면 감사하겠습니다. (개인 정보는 선택 기재)
              </div>

              <div style={formGroupRow}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>이름 (선택)</label>
                  <input 
                    type="text" 
                    value={surveyName}
                    onChange={(e) => setSurveyName(e.target.value)}
                    placeholder="성명"
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>소속 (선택)</label>
                  <input 
                    type="text" 
                    value={surveyOrg}
                    onChange={(e) => setSurveyOrg(e.target.value)}
                    placeholder="소속명"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>이번 Goyang Destination Week 2026 전반적 만족도 *</label>
                <div style={starContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSurveyRating(star)}
                      style={starBtnStyle}
                    >
                      <Star 
                        size={32} 
                        fill={star <= surveyRating ? '#fbbf24' : 'transparent'} 
                        color={star <= surveyRating ? '#fbbf24' : '#4b5563'} 
                      />
                    </button>
                  ))}
                  <span style={starRatingLabel}>{surveyRating}점</span>
                </div>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>행사의 만족 수준을 선택해 주세요 *</label>
                <div style={satisfactionGroup}>
                  {['매우 만족', '만족', '보통', '불만족'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSurveySatisfaction(level)}
                      style={satisfactionChipStyle(surveySatisfaction === level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>가장 유익했던 세션 분야는 어디인가요? (다중 선택)</label>
                <div style={interestGroup}>
                  {interestOptions.map((option) => {
                    const isSelected = surveyInterests.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleInterestToggle(option)}
                        style={interestChipStyle(isSelected)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>행사 운영진에게 남기고 싶은 의견이나 건의 사항</label>
                <textarea 
                  value={surveySuggestions}
                  onChange={(e) => setSurveySuggestions(e.target.value)}
                  placeholder="자유롭게 건의사항을 기재해 주십시오."
                  rows={4}
                  style={textareaStyle}
                />
              </div>

              <button type="submit" style={submitBtnStyle('#10b981')}>
                설문 제출 완료
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

/* ==========================================
   CSS IN JS Styles (Mobile App Feel)
   ========================================== */
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#0a0f0d', // 다크 그린/블랙 배경 적용
  color: '#f3f4f6',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'Outfit', 'Noto Sans KR', sans-serif",
  position: 'relative',
  overflowX: 'hidden',
  boxSizing: 'border-box',
};

const bgGlowLeft: React.CSSProperties = {
  position: 'absolute',
  top: '-10%',
  left: '-20%',
  width: '70vw',
  height: '70vw',
  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)',
  pointerEvents: 'none',
};

const bgGlowRight: React.CSSProperties = {
  position: 'absolute',
  bottom: '10%',
  right: '-30%',
  width: '80vw',
  height: '80vw',
  background: 'radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, rgba(0,0,0,0) 70%)',
  pointerEvents: 'none',
};

const innerContainer: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '2rem 1.25rem',
  boxSizing: 'border-box',
  flex: 1,
};

const logoWrapper: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '1.5rem',
  marginBottom: '1rem',
};

const sparkleIcon: React.CSSProperties = {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  padding: '0.6rem',
  borderRadius: '50%',
  marginBottom: '0.8rem',
};

const eventSubtitle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#34d399',
  textTransform: 'uppercase',
};

const eventTitle: React.CSSProperties = {
  fontSize: '1.65rem',
  fontWeight: '800',
  letterSpacing: '-0.5px',
  marginTop: '0.4rem',
  background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const eventSummaryCard: React.CSSProperties = {
  padding: '1.25rem',
  borderRadius: '16px',
  marginTop: '1rem',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const summaryRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
};

const summaryText: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#cbd5e1',
};

const dividerText: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#94a3b8',
  fontWeight: '600',
  marginTop: '2.5rem',
  marginBottom: '1rem',
  textAlign: 'left',
  paddingLeft: '0.2rem',
  letterSpacing: '0.5px',
};

const menuGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '1rem',
};

const menuBtnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '1.5rem 1.1rem',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'transform 0.2s, background-color 0.2s, border-color 0.2s',
  outline: 'none',
};

const btnIconWrapper: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '1.2rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
};

const btnLabelStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: '#ffffff',
  display: 'block',
};

const btnDescStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: '#94a3b8',
  marginTop: '0.35rem',
  lineHeight: '1.3',
};

const footerStyle: React.CSSProperties = {
  marginTop: 'auto',
  paddingTop: '3rem',
  textAlign: 'center',
  fontSize: '0.68rem',
  color: '#475569',
};

const formHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.8rem',
  paddingBottom: '0.8rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
};

const backBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: 'none',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#ffffff',
  cursor: 'pointer',
};

const formTitleText: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: '700',
  color: '#ffffff',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const formInfoBox: React.CSSProperties = {
  backgroundColor: 'rgba(16, 185, 129, 0.06)',
  border: '1px solid rgba(16, 185, 129, 0.15)',
  padding: '1rem',
  borderRadius: '12px',
  fontSize: '0.78rem',
  lineHeight: '1.5',
  color: '#34d399',
  marginBottom: '0.5rem',
};

const formGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const formGroupRow: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: '600',
  color: '#94a3b8',
  marginLeft: '0.2rem',
};

const inputStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#ffffff',
  padding: '0.85rem 1rem',
  borderRadius: '12px',
  fontSize: '0.88rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const textareaStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#ffffff',
  padding: '0.85rem 1rem',
  borderRadius: '12px',
  fontSize: '0.88rem',
  outline: 'none',
  resize: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
};

const submitBtnStyle = (color: string): React.CSSProperties => ({
  backgroundColor: color,
  color: '#ffffff',
  border: 'none',
  padding: '1rem',
  borderRadius: '14px',
  fontWeight: '700',
  fontSize: '0.95rem',
  cursor: 'pointer',
  marginTop: '1rem',
  boxShadow: `0 4px 14px ${color}40`,
  transition: 'transform 0.1s, opacity 0.2s',
});

const successCard: React.CSSProperties = {
  padding: '3rem 1.5rem',
  borderRadius: '24px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  marginTop: '2rem',
};

const successTitle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: '800',
  color: '#34d399',
  marginBottom: '0.5rem',
};

const successDesc: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#94a3b8',
  lineHeight: '1.6',
};

const starContainer: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.2rem',
};

const starBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '0.2rem',
  cursor: 'pointer',
  outline: 'none',
};

const starRatingLabel: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: '700',
  color: '#fbbf24',
  marginLeft: '0.5rem',
};

const satisfactionGroup: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
};

const satisfactionChipStyle = (selected: boolean): React.CSSProperties => ({
  flex: 1,
  backgroundColor: selected ? '#10b981' : 'rgba(255, 255, 255, 0.04)',
  border: selected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
  color: selected ? '#ffffff' : '#cbd5e1',
  padding: '0.7rem 0',
  borderRadius: '10px',
  fontSize: '0.8rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'center',
});

const interestGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const interestChipStyle = (selected: boolean): React.CSSProperties => ({
  backgroundColor: selected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
  border: selected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.06)',
  color: selected ? '#34d399' : '#cbd5e1',
  padding: '0.8rem 1rem',
  borderRadius: '12px',
  fontSize: '0.8rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'left',
  width: '100%',
});
