import React from 'react';
import { useAttendees } from '../context/AttendeeContext';
import { Users, UserCheck, UserPlus, Printer, Clock, BarChart3, Tag } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { attendees, printLogs } = useAttendees();

  const totalCount = attendees.length;
  
  const preRegistered = attendees.filter(a => a.registeredType === '사전');
  const preRegisteredTotal = preRegistered.length;
  const preRegisteredAttended = preRegistered.filter(a => a.isAttended).length;
  const preRegAttendedRate = preRegisteredTotal > 0 
    ? Math.round((preRegisteredAttended / preRegisteredTotal) * 100) 
    : 0;

  const onsiteRegistered = attendees.filter(a => a.registeredType === '현장');
  const onsiteTotal = onsiteRegistered.length;
  const onsiteAttended = onsiteRegistered.filter(a => a.isAttended).length;

  const totalAttended = attendees.filter(a => a.isAttended).length;
  const totalAttendedRate = totalCount > 0 ? Math.round((totalAttended / totalCount) * 100) : 0;

  const deskStats: { [key: string]: number } = {};
  printLogs.forEach(log => {
    const dId = log.deskId || 'Unknown';
    deskStats[dId] = (deskStats[dId] || 0) + 1;
  });

  const allDesks = Array.from(new Set(['Desk-01', 'Desk-02', 'Desk-03', ...Object.keys(deskStats)])).sort();
  const maxDeskPrints = Math.max(...Object.values(deskStats), 1);

  const typeStats: { [key: string]: { total: number; attended: number } } = {};
  attendees.forEach(a => {
    if (!typeStats[a.type]) {
      typeStats[a.type] = { total: 0, attended: 0 };
    }
    typeStats[a.type].total += 1;
    if (a.isAttended) {
      typeStats[a.type].attended += 1;
    }
  });

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in" style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Goyang Destination Week 2026</h1>
          <p style={subtitleStyle}>실시간 현장 등록 및 ID카드 발급 통합 대시보드</p>
        </div>
        <div style={liveBadgeContainer}>
          <span style={liveDot}></span>
          <span style={liveText}>LIVE MONITORING</span>
        </div>
      </div>

      <div style={statsGrid}>
        <div className="glass" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={{ ...iconBgStyle, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
              <Users size={22} />
            </span>
            <span style={cardTitleStyle}>총 등록 인원</span>
          </div>
          <div style={cardValueStyle}>{totalCount}<span style={unitStyle}>명</span></div>
          <div style={{ ...cardMetaStyle, color: 'var(--text-secondary)' }}>
            사전 {preRegisteredTotal}명 | 현장 {onsiteTotal}명
          </div>
        </div>

        <div className="glass" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={{ ...iconBgStyle, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <UserCheck size={22} />
            </span>
            <span style={cardTitleStyle}>전체 입장/참석</span>
          </div>
          <div style={cardValueStyle}>
            {totalAttended}
            <span style={{ ...rateStyle, color: 'var(--accent)' }}> ({totalAttendedRate}%)</span>
          </div>
          <div style={progressContainer}>
            <div style={{ ...progressBar, width: `${totalAttendedRate}%`, backgroundColor: 'var(--accent)' }} />
          </div>
        </div>

        <div className="glass" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={{ ...iconBgStyle, backgroundColor: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa' }}>
              <Clock size={22} />
            </span>
            <span style={cardTitleStyle}>사전등록 참석률</span>
          </div>
          <div style={cardValueStyle}>
            {preRegisteredAttended}
            <span style={slashStyle}>/</span>
            <span style={subValueStyle}>{preRegisteredTotal}</span>
            <span style={{ ...rateStyle, color: '#a78bfa' }}> ({preRegAttendedRate}%)</span>
          </div>
          <div style={progressContainer}>
            <div style={{ ...progressBar, width: `${preRegAttendedRate}%`, backgroundColor: '#a78bfa' }} />
          </div>
        </div>

        <div className="glass" style={cardStyle}>
          <div style={cardHeaderStyle}>
            <span style={{ ...iconBgStyle, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
              <UserPlus size={22} />
            </span>
            <span style={cardTitleStyle}>현장 등록 (즉시입장)</span>
          </div>
          <div style={cardValueStyle}>
            {onsiteTotal}
            <span style={unitStyle}>명</span>
          </div>
          <div style={{ ...cardMetaStyle, color: '#f87171' }}>
            발급률 {onsiteTotal > 0 ? Math.round((onsiteAttended / onsiteTotal) * 100) : 0}% ({onsiteAttended}건 완료)
          </div>
        </div>
      </div>

      <div style={middleGrid}>
        <div className="glass" style={{ ...panelStyle, flex: 1.2 }}>
          <div style={panelHeaderStyle}>
            <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={panelTitleStyle}>바코드 프린터 데스크별 출력량</h2>
          </div>
          <div style={deskBarChartContainer}>
            {allDesks.map(desk => {
              const count = deskStats[desk] || 0;
              const percent = maxDeskPrints > 0 ? (count / maxDeskPrints) * 100 : 0;
              return (
                <div key={desk} style={deskBarRow}>
                  <div style={deskLabelStyle}>
                    <Printer size={14} style={{ marginRight: '6px', color: 'var(--text-muted)' }} />
                    <span style={deskNameText}>{desk}</span>
                  </div>
                  <div style={deskBarTrack}>
                    <div style={{ ...deskBarFill, width: `${percent}%` }} />
                  </div>
                  <div style={deskValueStyle}>{count}건</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass" style={{ ...panelStyle, flex: 1 }}>
          <div style={panelHeaderStyle}>
            <Tag size={18} style={{ color: 'var(--mint)' }} />
            <h2 style={panelTitleStyle}>구분별 입장 현황 (참석 / 총등록)</h2>
          </div>
          <div style={typeListContainer}>
            {Object.keys(typeStats).length > 0 ? (
              Object.entries(typeStats).map(([type, data]) => {
                const percent = data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0;
                return (
                  <div key={type} style={typeRowStyle}>
                    <div style={typeLabelWrapper}>
                      <span style={typeBadgeStyle(type)}>{type}</span>
                    </div>
                    <div style={typeDataWrapper}>
                      <span style={typeCountText}>
                        {data.attended} <span style={typeSlashStyle}>/</span> {data.total} 명
                      </span>
                      <span style={typePercentText}>{percent}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={emptyDataStyle}>참가자 데이터가 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      <div className="glass" style={panelStyle}>
        <div style={panelHeaderStyle}>
          <Clock size={18} style={{ color: 'var(--accent)' }} />
          <h2 style={panelTitleStyle}>실시간 ID카드 출력 및 입장 타임라인 (최근 10건)</h2>
        </div>
        <div style={timelineContainer}>
          {printLogs.length > 0 ? (
            printLogs.slice(0, 10).map((log, index) => (
              <div 
                key={log.id} 
                style={{ 
                  ...timelineRow, 
                  borderBottom: index === printLogs.length - 1 || index === 9 ? 'none' : '1px solid var(--border)',
                  animation: 'fadeIn 0.3s ease forwards'
                }}
              >
                <div style={timelineTime}>
                  <Clock size={12} style={{ marginRight: '4px', color: 'var(--text-muted)' }} />
                  {formatTime(log.printedAt)}
                </div>
                <div style={timelineContent}>
                  <span style={timelineDesk}>[{log.deskId}]</span>
                  <span style={timelineName}>{log.name}</span>
                  <span style={timelineOrg}>{log.organization}</span>
                  <span style={timelineRegType(log.registeredType)}>
                    {log.registeredType}등록
                  </span>
                </div>
                <div>
                  <span style={timelineBadge(log.type)}>{log.type}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={emptyTimelineStyle}>
              현재 입장 처리된 내역이 없습니다. 스캐너에서 QR을 태그하거나 현장 등록을 진행해 주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
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

const liveBadgeContainer: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  padding: '0.4rem 0.8rem',
  borderRadius: '20px',
  border: '1px solid rgba(16, 185, 129, 0.2)',
};

const liveDot: React.CSSProperties = {
  width: '8px',
  height: '8px',
  backgroundColor: 'var(--accent)',
  borderRadius: '50%',
  display: 'inline-block',
};

const liveText: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--accent)',
  letterSpacing: '0.5px',
};

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1.2rem',
};

const cardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1rem',
};

const iconBgStyle: React.CSSProperties = {
  width: '38px',
  height: '38px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '500',
  color: 'var(--text-secondary)',
};

const cardValueStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: '700',
  fontFamily: 'var(--font-title)',
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'baseline',
};

const unitStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: '500',
  color: 'var(--text-secondary)',
  marginLeft: '4px',
};

const slashStyle: React.CSSProperties = {
  color: 'var(--border)',
  margin: '0 4px',
  fontWeight: '300',
};

const subValueStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  color: 'var(--text-secondary)',
  fontWeight: '500',
};

const rateStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: '600',
  marginLeft: '6px',
};

const cardMetaStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  marginTop: 'auto',
};

const progressContainer: React.CSSProperties = {
  width: '100%',
  height: '4px',
  backgroundColor: 'var(--border)',
  borderRadius: '2px',
  marginTop: '0.75rem',
  overflow: 'hidden',
};

const progressBar: React.CSSProperties = {
  height: '100%',
  borderRadius: '2px',
  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
};

const middleGrid: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.2rem',
};

const panelStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
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
  fontSize: '0.95rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
};

const deskBarChartContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  justifyContent: 'center',
  flex: 1,
};

const deskBarRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const deskLabelStyle: React.CSSProperties = {
  width: '90px',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

const deskNameText: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: '600',
};

const deskBarTrack: React.CSSProperties = {
  flex: 1,
  height: '12px',
  backgroundColor: 'var(--bg-tertiary)',
  borderRadius: '6px',
  overflow: 'hidden',
  border: '1px solid var(--border)',
};

const deskBarFill: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
  borderRadius: '6px',
  transition: 'width 0.5s ease',
};

const deskValueStyle: React.CSSProperties = {
  width: '50px',
  textAlign: 'right',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--accent)',
};

const typeListContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  flex: 1,
  justifyContent: 'center',
};

const typeRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.4rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.02)',
};

const typeLabelWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const typeBadgeStyle = (type: string): React.CSSProperties => {
  let color = 'var(--general-color)';
  let bg = 'var(--general-bg)';
  
  if (type === 'VIP') { color = 'var(--vip-color)'; bg = 'var(--vip-bg)'; }
  else if (type === '연사') { color = 'var(--speaker-color)'; bg = 'var(--speaker-bg)'; }
  else if (type === '스태프') { color = 'var(--staff-color)'; bg = 'var(--staff-bg)'; }
  else if (type === '기자') { color = 'var(--press-color)'; bg = 'var(--press-bg)'; }

  return {
    fontSize: '0.75rem',
    fontWeight: '700',
    color,
    backgroundColor: bg,
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    border: `1px solid rgba(${color === 'var(--vip-color)' ? '251,191,36' : '96,165,250'}, 0.2)`
  };
};

const typeDataWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const typeCountText: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '500',
};

const typeSlashStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
};

const typePercentText: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  width: '35px',
  textAlign: 'right',
};

const timelineContainer: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '320px',
  overflowY: 'auto',
};

const timelineRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.8rem 0.5rem',
};

const timelineTime: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  width: '100px',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

const timelineContent: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  fontSize: '0.85rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const timelineDesk: React.CSSProperties = {
  fontWeight: '600',
  color: 'var(--accent)',
};

const timelineName: React.CSSProperties = {
  fontWeight: '700',
};

const timelineOrg: React.CSSProperties = {
  color: 'var(--text-secondary)',
};

const timelineRegType = (regType: '사전' | '현장'): React.CSSProperties => ({
  fontSize: '0.7rem',
  backgroundColor: regType === '사전' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
  color: regType === '사전' ? '#60a5fa' : '#f87171',
  padding: '0.1rem 0.4rem',
  borderRadius: '3px',
});

const timelineBadge = (type: string): React.CSSProperties => {
  let color = '#3b82f6';
  if (type === 'VIP') color = '#fbbf24';
  else if (type === '연사') color = '#a78bfa';
  else if (type === '스태프') color = '#f87171';
  else if (type === '기자') color = '#2dd4bf';

  return {
    fontSize: '0.7rem',
    fontWeight: '700',
    border: `1px solid ${color}`,
    color,
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
  };
};

const emptyDataStyle: React.CSSProperties = {
  textAlign: 'center',
  color: 'var(--text-muted)',
  padding: '2rem 0',
  fontSize: '0.85rem',
};

const emptyTimelineStyle: React.CSSProperties = {
  textAlign: 'center',
  color: 'var(--text-muted)',
  padding: '3rem 0',
  fontSize: '0.85rem',
};
