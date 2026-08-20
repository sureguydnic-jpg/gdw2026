import React, { useState } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import { 
  MessageSquare, 
  ClipboardList, 
  Search, 
  CheckCircle2, 
  Download, 
  Trash2, 
  Star, 
  Users, 
  BarChart3, 
  Sparkles
} from 'lucide-react';


export const PortalAdmin: React.FC = () => {
  const { preQnas, preSurveys, toggleQnaReviewed, clearPortalData } = useAttendees();
  const [adminTab, setAdminTab] = useState<'qna' | 'survey'>('qna');

  // Search filter for Q&A
  const [qnaSearch, setQnaSearch] = useState('');
  const [hideReviewed, setHideReviewed] = useState(false);

  // Q&A Filtered List
  const filteredQnas = preQnas.filter(qna => {
    const matchesSearch = 
      qna.name.toLowerCase().includes(qnaSearch.toLowerCase()) ||
      qna.organization.toLowerCase().includes(qnaSearch.toLowerCase()) ||
      qna.question.toLowerCase().includes(qnaSearch.toLowerCase());
    
    const matchesReviewed = hideReviewed ? !qna.isReviewed : true;
    
    return matchesSearch && matchesReviewed;
  });

  // Calculate Survey Aggregates
  const totalSurveys = preSurveys.length;
  
  const avgRating = totalSurveys > 0
    ? (preSurveys.reduce((sum, s) => sum + s.rating, 0) / totalSurveys).toFixed(1)
    : '0.0';

  // Satisfaction stats
  const satisfactionCounts: Record<string, number> = {
    '매우 만족': 0,
    '만족': 0,
    '보통': 0,
    '불만족': 0
  };
  preSurveys.forEach(s => {
    if (satisfactionCounts[s.satisfaction] !== undefined) {
      satisfactionCounts[s.satisfaction]++;
    }
  });

  // Interest area stats
  const interestCounts: Record<string, number> = {};
  preSurveys.forEach(s => {
    (s.interestAreas || []).forEach(area => {
      interestCounts[area] = (interestCounts[area] || 0) + 1;
    });
  });

  const sortedInterests = Object.entries(interestCounts).sort((a, b) => b[1] - a[1]);

  // Export Q&A to CSV
  const handleExportQna = () => {
    if (preQnas.length === 0) {
      alert('다운로드할 사전 질문 데이터가 없습니다.');
      return;
    }

    const headers = ['ID', '이름', '소속', '질문 내용', '등록 일시', '검토 여부'];
    const rows = preQnas.map(q => [
      q.id,
      q.name,
      q.organization,
      q.question.replace(/\n/g, ' '),
      q.createdAt,
      q.isReviewed ? '검토완료' : '미검토'
    ]);

    const csvContent = 
      '\uFEFF' + // UTF-8 BOM for Excel Korean support
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GDW2026_PreQna_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Survey to CSV
  const handleExportSurvey = () => {
    if (preSurveys.length === 0) {
      alert('다운로드할 설문 데이터가 없습니다.');
      return;
    }

    const headers = ['ID', '이름', '소속', '기대 점수', '만족도 수준', '관심 분야', '건의 및 기대글', '등록 일시'];
    const rows = preSurveys.map(s => [
      s.id,
      s.name || '익명',
      s.organization || '익명',
      s.rating.toString(),
      s.satisfaction,
      (s.interestAreas || []).join('; '),
      (s.suggestions || '').replace(/\n/g, ' '),
      s.createdAt
    ]);

    const csvContent = 
      '\uFEFF' + // UTF-8 BOM
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GDW2026_PreSurvey_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clear portal data confirmation
  const handleClearData = () => {
    if (window.confirm('정말로 모바일 포털에서 수집된 모든 사전 질문(Q&A) 및 설문 데이터를 삭제하시겠습니까? (이 작업은 되돌릴 수 없으며, 명찰/참석 데이터는 삭제되지 않습니다.)')) {
      clearPortalData();
      alert('데이터가 성공적으로 초기화되었습니다.');
    }
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      {/* 관리자 서브 헤더 */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>모바일 포털 참여 관리</h1>
          <p style={subtitleStyle}>모바일 포털을 통해 접수된 사전 질문 및 설문조사 결과를 실시간으로 관리하고 통계를 봅니다.</p>
        </div>

        {/* 제어 버튼 */}
        <div style={actionGroup}>
          <button style={btnDangerStyle} onClick={handleClearData} title="모든 사전 질문 및 설문 데이터 삭제">
            <Trash2 size={14} style={{ marginRight: '6px' }} />
            포털 데이터 초기화
          </button>
        </div>
      </div>

      {/* 내부 메뉴 탭 분기 */}
      <div style={tabContainerStyle}>
        <button 
          style={adminTab === 'qna' ? activeTabBtn : tabBtn} 
          onClick={() => setAdminTab('qna')}
        >
          <MessageSquare size={16} />
          사전 질문 목록 ({preQnas.length}건)
        </button>
        <button 
          style={adminTab === 'survey' ? activeTabBtn : tabBtn} 
          onClick={() => setAdminTab('survey')}
        >
          <ClipboardList size={16} />
          설문조사 분석 ({preSurveys.length}건)
        </button>
      </div>

      {/* 탭 1: 사전 질문 관리 */}
      {adminTab === 'qna' && (
        <div style={contentGrid}>
          {/* 검색 및 필터 패널 */}
          <div className="glass" style={filterPanel}>
            <div style={searchWrapper}>
              <Search size={16} color="var(--text-muted)" style={{ marginLeft: '12px' }} />
              <input 
                type="text" 
                value={qnaSearch}
                onChange={(e) => setQnaSearch(e.target.value)}
                placeholder="작성자, 소속, 질문 내용 검색..."
                style={searchInputStyle}
              />
            </div>
            
            <div style={checkboxWrapper}>
              <input 
                type="checkbox" 
                id="hideReviewed"
                checked={hideReviewed}
                onChange={(e) => setHideReviewed(e.target.checked)}
                style={checkboxStyle}
              />
              <label htmlFor="hideReviewed" style={checkboxLabel}>검토 완료된 질문 숨기기</label>
            </div>

            <button style={btnExportStyle} onClick={handleExportQna}>
              <Download size={14} style={{ marginRight: '6px' }} />
              CSV 내보내기
            </button>
          </div>

          {/* 질문 목록 영역 */}
          <div style={qnaListWrapper}>
            {filteredQnas.length > 0 ? (
              filteredQnas.map((qna) => (
                <div 
                  key={qna.id} 
                  className="glass" 
                  style={qnaCardStyle(qna.isReviewed)}
                >
                  <div style={qnaHeader}>
                    <div>
                      <span style={qnaNameStyle}>{qna.name}</span>
                      <span style={qnaOrgStyle}>{qna.organization}</span>
                    </div>
                    <span style={qnaTimeStyle}>{new Date(qna.createdAt).toLocaleString('ko-KR', { hour: '2-digit', minute:'2-digit', second:'2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div style={qnaBody}>
                    {qna.question}
                  </div>
                  <div style={qnaFooter}>
                    <button 
                      style={btnReviewStyle(qna.isReviewed)} 
                      onClick={() => toggleQnaReviewed(qna.id)}
                    >
                      <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
                      {qna.isReviewed ? '검토 완료됨' : '검토 완료 표시'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass" style={emptyDataStyle}>
                접수된 질문이 없거나 필터 조건에 맞는 질문이 존재하지 않습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 탭 2: 설문조사 분석 */}
      {adminTab === 'survey' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 상단 통계 카드 */}
          <div style={summaryGrid}>
            <div className="glass" style={kpiCardStyle}>
              <div style={kpiHeader}>
                <span style={{ ...iconBg, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                  <Users size={20} />
                </span>
                <span style={kpiTitle}>총 설문 응답자</span>
              </div>
              <div style={kpiValue}>{totalSurveys}<span style={kpiUnit}>명</span></div>
              <button style={{ ...btnExportStyle, width: '100%', marginTop: '1rem' }} onClick={handleExportSurvey}>
                <Download size={14} style={{ marginRight: '6px' }} />
                설문 데이터 CSV 저장
              </button>
            </div>

            <div className="glass" style={kpiCardStyle}>
              <div style={kpiHeader}>
                <span style={{ ...iconBg, backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                  <Star size={20} />
                </span>
                <span style={kpiTitle}>행사 평균 만족도</span>
              </div>
              <div style={kpiValue}>
                {avgRating}
                <span style={kpiSlash}>/</span>
                <span style={kpiSubValue}>5.0</span>
              </div>
              <div style={starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={16} 
                    fill={star <= Math.round(Number(avgRating)) ? '#fbbf24' : 'transparent'} 
                    color={star <= Math.round(Number(avgRating)) ? '#fbbf24' : '#4b5563'} 
                  />
                ))}
              </div>
            </div>

            <div className="glass" style={{ ...kpiCardStyle, flex: 1.5 }}>
              <div style={kpiHeader}>
                <span style={{ ...iconBg, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <BarChart3 size={20} />
                </span>
                <span style={kpiTitle}>만족도 수준 분포</span>
              </div>
              <div style={distributionList}>
                {Object.entries(satisfactionCounts).map(([level, count]) => {
                  const percent = totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0;
                  return (
                    <div key={level} style={distRow}>
                      <span style={distLabel}>{level}</span>
                      <div style={distTrack}>
                        <div style={{ ...distBar, width: `${percent}%`, backgroundColor: level === '매우 만족' ? '#ec4899' : level === '만족' ? '#8b5cf6' : level === '보통' ? '#3b82f6' : '#ef4444' }} />
                      </div>
                      <span style={distCount}>{count}명 ({percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={bottomGrid}>
            {/* 좌측: 유익했던 세션 분야 */}
            <div className="glass" style={{ ...panelStyle, flex: 1.2 }}>
              <div style={panelHeader}>
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                <h2 style={panelTitle}>세션/프로그램 주제별 만족도 (복수 선택 집계)</h2>
              </div>
              <div style={interestList}>
                {sortedInterests.length > 0 ? (
                  sortedInterests.map(([area, count]) => {
                    const percent = totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0;
                    return (
                      <div key={area} style={interestRow}>
                        <div style={interestTextWrapper}>
                          <span style={interestName}>{area}</span>
                          <span style={interestCountText}>{count}표 ({percent}%)</span>
                        </div>
                        <div style={interestTrack}>
                          <div style={{ ...interestBar, width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={emptyDataStyle}>유익했던 세션 응답 데이터가 없습니다.</div>
                )}
              </div>
            </div>

            {/* 우측: 건의 사항 및 피드백 */}
            <div className="glass" style={{ ...panelStyle, flex: 1 }}>
              <div style={panelHeader}>
                <MessageSquare size={18} style={{ color: 'var(--mint)' }} />
                <h2 style={panelTitle}>운영진에게 남긴 건의사항 및 의견 피드백</h2>
              </div>
              <div style={suggestionsList}>
                {preSurveys.filter(s => s.suggestions && s.suggestions.trim() !== '').length > 0 ? (
                  preSurveys
                    .filter(s => s.suggestions && s.suggestions.trim() !== '')
                    .map((survey) => (
                      <div key={survey.id} style={suggestionCard}>
                        <p style={suggestionText}>"{survey.suggestions}"</p>
                        <div style={suggestionMeta}>
                          <span>{survey.name || '익명'} ({survey.organization || '소속 미기재'})</span>
                          <span>{new Date(survey.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div style={emptyDataStyle}>기록된 건의 사항이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================
   CSS IN JS (PortalAdmin.tsx)
   ========================================== */
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  width: '100%',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '1rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.8rem',
  fontWeight: '700',
  fontFamily: 'var(--font-title)',
  color: 'var(--text-primary)',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  marginTop: '0.2rem',
};

const actionGroup: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
};

const btnDangerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#f87171',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const tabContainerStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid var(--border)',
  gap: '0.5rem',
  marginBottom: '0.5rem',
};

const baseTab: React.CSSProperties = {
  padding: '0.85rem 1.25rem',
  fontSize: '0.88rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  backgroundColor: 'transparent',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  borderBottom: '2px solid transparent',
};

const tabBtn: React.CSSProperties = {
  ...baseTab,
};

const activeTabBtn: React.CSSProperties = {
  ...baseTab,
  color: 'var(--accent)',
  borderBottom: '2px solid var(--accent)',
};

const contentGrid: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const filterPanel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem',
  borderRadius: '12px',
  flexWrap: 'wrap',
  gap: '1rem',
};

const searchWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  width: '320px',
};

const searchInputStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#ffffff',
  padding: '0.5rem 0.75rem',
  fontSize: '0.85rem',
  width: '100%',
  outline: 'none',
};

const checkboxWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const checkboxStyle: React.CSSProperties = {
  cursor: 'pointer',
};

const checkboxLabel: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
};

const btnExportStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.15)',
  color: '#60a5fa',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const qnaListWrapper: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  maxHeight: '600px',
  overflowY: 'auto',
  paddingRight: '0.2rem',
};

const qnaCardStyle = (reviewed: boolean): React.CSSProperties => ({
  padding: '1.25rem',
  borderRadius: '14px',
  border: reviewed ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid var(--border)',
  opacity: reviewed ? 0.6 : 1,
  transition: 'opacity 0.2s, border-color 0.2s',
});

const qnaHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  paddingBottom: '0.6rem',
  marginBottom: '0.8rem',
};

const qnaNameStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
};

const qnaOrgStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  marginLeft: '0.5rem',
  backgroundColor: 'var(--bg-tertiary)',
  padding: '0.15rem 0.4rem',
  borderRadius: '4px',
};

const qnaTimeStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
};

const qnaBody: React.CSSProperties = {
  fontSize: '0.9rem',
  lineHeight: '1.5',
  color: 'var(--text-primary)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
};

const qnaFooter: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '0.8rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.03)',
  paddingTop: '0.6rem',
};

const btnReviewStyle = (reviewed: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: reviewed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.04)',
  border: reviewed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)',
  color: reviewed ? '#34d399' : 'var(--text-secondary)',
  padding: '0.35rem 0.75rem',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
});

const emptyDataStyle: React.CSSProperties = {
  textAlign: 'center',
  color: 'var(--text-muted)',
  padding: '3.5rem 0',
  fontSize: '0.88rem',
  borderRadius: '12px',
};

const summaryGrid: React.CSSProperties = {
  display: 'flex',
  gap: '1.25rem',
  flexWrap: 'wrap',
};

const kpiCardStyle: React.CSSProperties = {
  flex: 1,
  padding: '1.5rem',
  borderRadius: '14px',
  display: 'flex',
  flexDirection: 'column',
};

const kpiHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  marginBottom: '1rem',
};

const iconBg: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const kpiTitle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '500',
  color: 'var(--text-secondary)',
};

const kpiValue: React.CSSProperties = {
  fontSize: '2.2rem',
  fontWeight: '700',
  fontFamily: 'var(--font-title)',
  display: 'flex',
  alignItems: 'baseline',
};

const kpiUnit: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: '500',
  color: 'var(--text-muted)',
  marginLeft: '4px',
};

const kpiSlash: React.CSSProperties = {
  color: 'var(--border)',
  margin: '0 4px',
  fontWeight: '300',
  fontSize: '1.5rem',
};

const kpiSubValue: React.CSSProperties = {
  fontSize: '1.25rem',
  color: 'var(--text-muted)',
  fontWeight: '500',
};

const starsRow: React.CSSProperties = {
  display: 'flex',
  gap: '0.25rem',
  marginTop: '0.75rem',
};

const distributionList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginTop: '0.25rem',
};

const distRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.78rem',
};

const distLabel: React.CSSProperties = {
  width: '65px',
  fontWeight: '600',
};

const distTrack: React.CSSProperties = {
  flex: 1,
  height: '8px',
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '4px',
  margin: '0 0.75rem',
  overflow: 'hidden',
};

const distBar: React.CSSProperties = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.4s ease',
};

const distCount: React.CSSProperties = {
  width: '80px',
  textAlign: 'right',
  color: 'var(--text-secondary)',
  fontWeight: '500',
};

const bottomGrid: React.CSSProperties = {
  display: 'flex',
  gap: '1.25rem',
  flexWrap: 'wrap',
};

const panelStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '14px',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '480px',
};

const panelHeader: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderBottom: '1px solid var(--border)',
  paddingBottom: '0.6rem',
  marginBottom: '1rem',
};

const panelTitle: React.CSSProperties = {
  fontSize: '0.92rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const interestList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  overflowY: 'auto',
  flex: 1,
};

const interestRow: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const interestTextWrapper: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.82rem',
};

const interestName: React.CSSProperties = {
  fontWeight: '600',
};

const interestCountText: React.CSSProperties = {
  color: 'var(--accent)',
  fontWeight: '700',
};

const interestTrack: React.CSSProperties = {
  width: '100%',
  height: '10px',
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '5px',
  overflow: 'hidden',
  border: '1px solid var(--border)',
};

const interestBar: React.CSSProperties = {
  height: '100%',
  borderRadius: '5px',
  background: 'linear-gradient(90deg, #ec4899 0%, #a78bfa 100%)',
  transition: 'width 0.4s ease',
};

const suggestionsList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  overflowY: 'auto',
  flex: 1,
};

const suggestionCard: React.CSSProperties = {
  backgroundColor: 'var(--bg-tertiary)',
  border: '1px solid var(--border)',
  padding: '0.85rem 1rem',
  borderRadius: '10px',
};

const suggestionText: React.CSSProperties = {
  fontSize: '0.85rem',
  lineHeight: '1.45',
  color: 'var(--text-primary)',
  fontStyle: 'italic',
};

const suggestionMeta: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginTop: '0.6rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.03)',
  paddingTop: '0.4rem',
};
