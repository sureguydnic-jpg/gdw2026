import React, { useState, useRef } from 'react';
import { useAttendees } from '../context/AttendeeContext';
import type { Attendee } from '../types';
import { Search, Upload, Download, Trash2, Printer, RefreshCw, FileText } from 'lucide-react';

interface AttendeeListProps {
  onPrintTrigger: (attendee: Attendee) => void;
}

export const AttendeeList: React.FC<AttendeeListProps> = ({ onPrintTrigger }) => {
  const { attendees, importAttendees, clearAllData, generateDummyData, printAttendee } = useAttendees();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    const result: Omit<Attendee, 'id' | 'isAttended' | 'printedCount' | 'registeredType'>[] = [];
    
    if (lines.length <= 1) return result;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const parts = matches.map(p => p.replace(/^"|"$/g, '').trim());

      if (parts.length >= 4) {
        result.push({
          type: parts[0] || '일반',
          organization: parts[1] || '소속 미정',
          position: parts[2] || '직책 미정',
          name: parts[3] || '이름 없음',
          phone: parts[4] || undefined,
          email: parts[5] || undefined,
          privacyAgree: parts[4] || parts[5] ? true : undefined,
          code: ''
        });
      }
    }
    return result;
  };

  const handleFile = (file: File) => {
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          importAttendees(parsed);
          alert(`성공적으로 ${parsed.length}명의 사전등록 데이터를 불러왔습니다.`);
        } else {
          alert('CSV 파일 구조가 올바르지 않습니다. (구분, 소속, 직책, 이름 구조여야 합니다.)');
        }
      };
      reader.readAsText(file, 'UTF-8');
    } else {
      alert('CSV 형식의 파일만 업로드할 수 있습니다.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const csvContent = '\uFEFF구분,소속,직책,이름,연락처,이메일\nVIP,고양컨벤션뷰로,이사장,김고양,010-2026-1001,goyang.kim@gdw.or.kr\n연사,한국관광공사,본부장,이한국,010-2026-1002,hk.lee@knto.or.kr\n일반,킨텍스 보안팀,팀장,강보안,010-2026-1234,security@kintex.com';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Goyang_Destination_Week_2026_템플릿.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    document.body.removeChild(link);
  };

  const filteredAttendees = attendees.filter(att => {
    const matchesSearch = 
      att.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.code.includes(searchQuery);

    const matchesType = typeFilter === 'ALL' || att.type === typeFilter;
    
    let matchesAttendance = true;
    if (attendanceFilter === 'ATTENDED') matchesAttendance = att.isAttended;
    else if (attendanceFilter === 'NOT_ATTENDED') matchesAttendance = !att.isAttended;

    return matchesSearch && matchesType && matchesAttendance;
  });

  const availableTypes = Array.from(new Set(attendees.map(a => a.type)));

  return (
    <div className="animate-fade-in" style={containerStyle}>
      <div style={uploadRowStyle}>
        <div 
          className="glass"
          style={{ 
            ...dropZoneStyle, 
            borderColor: dragActive ? 'var(--accent)' : 'var(--border)',
            backgroundColor: dragActive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(17, 24, 21, 0.4)'
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
            accept=".csv"
          />
          <Upload size={32} style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
          <p style={dropZoneText}>
            사전등록 CSV 파일을 드래그하여 놓거나 <strong>클릭하여 업로드</strong>하세요.
          </p>
          <p style={dropZoneSubtext}>지원 형식: .csv (구분, 소속, 직책, 이름)</p>
        </div>

        <div className="glass" style={controlPanelStyle}>
          <h3 style={controlTitle}>데이터 관리 설정</h3>
          <div style={buttonGroupStyle}>
            <button style={btnTemplateStyle} onClick={downloadTemplate}>
              <Download size={16} style={{ marginRight: '6px' }} />
              엑셀 업로드 템플릿 다운로드
            </button>
            <button style={btnDummyStyle} onClick={generateDummyData}>
              <RefreshCw size={16} style={{ marginRight: '6px' }} />
              시연용 더미 데이터 로드
            </button>
            <button style={btnDeleteStyle} onClick={() => {
              if (window.confirm('전체 데이터를 삭제하시겠습니까? 데이터 및 인쇄 로그가 초기화됩니다.')) {
                clearAllData();
              }
            }}>
              <Trash2 size={16} style={{ marginRight: '6px' }} />
              전체 데이터 초기화
            </button>
          </div>
        </div>
      </div>

      <div className="glass" style={filterBarContainer}>
        <div style={searchWrapper}>
          <Search size={18} style={searchIcon} />
          <input 
            type="text" 
            placeholder="이름, 소속, 또는 등록코드로 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
          />
        </div>

        <div style={filterSelectGroup}>
          <div style={selectWrapper}>
            <span style={selectLabel}>참가자 구분:</span>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="ALL">전체 구분</option>
              {availableTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={selectWrapper}>
            <span style={selectLabel}>참석(발급) 여부:</span>
            <select 
              value={attendanceFilter} 
              onChange={(e) => setAttendanceFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="ALL">전체 상태</option>
              <option value="ATTENDED">참석 (발급 완료)</option>
              <option value="NOT_ATTENDED">미참석 (미발급)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass" style={tableContainerStyle}>
        <div style={tableHeaderRow}>
          <h2>참가자 목록 ({filteredAttendees.length}명 / 총 {attendees.length}명)</h2>
        </div>
        <div style={tableWrapper}>
          <table style={tableStyle}>
            <thead>
              <tr style={thRowStyle}>
                <th style={thStyle}>등록코드</th>
                <th style={thStyle}>구분</th>
                <th style={thStyle}>이름</th>
                <th style={thStyle}>소속</th>
                <th style={thStyle}>직책</th>
                <th style={thStyle}>연락처</th>
                <th style={thStyle}>이메일</th>
                <th style={thStyle}>등록</th>
                <th style={thStyle}>발급 일시</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>발급 횟수</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map(att => (
                  <tr key={att.id} style={trStyle}>
                    <td style={tdCodeStyle}>{att.code}</td>
                    <td>
                      <span style={typeBadgeStyle(att.type)}>{att.type}</span>
                    </td>
                    <td style={tdNameStyle}>{att.name}</td>
                    <td style={tdOrgStyle}>{att.organization}</td>
                    <td style={tdPosStyle}>{att.position}</td>
                    <td style={tdStyle}>{att.phone || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                    <td style={tdStyle}>{att.email || <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                    <td>
                      <span style={regBadgeStyle(att.registeredType)}>
                        {att.registeredType}
                      </span>
                    </td>
                    <td>
                      {att.isAttended ? (
                        <div style={statusAttendedStyle}>
                          <span style={statusDot(true)} />
                          <span>{formatDateTime(att.attendedAt || '')}</span>
                        </div>
                      ) : (
                        <div style={statusAbsentStyle}>
                          <span style={statusDot(false)} />
                          <span>미발급</span>
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>
                      {att.printedCount > 0 ? (
                        <span style={printCountBadge}>{att.printedCount}회</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button 
                        style={btnPrintRowStyle} 
                        onClick={() => {
                          printAttendee(att.id);
                          onPrintTrigger(att);
                        }}
                        title="ID카드 출력"
                      >
                        <Printer size={14} style={{ marginRight: '4px' }} />
                        명찰 발급
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} style={emptyCellstyle}>
                    <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <p>검색 조건과 일치하는 참가자가 없습니다.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const formatDateTime = (isoString: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const uploadRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.2rem',
};

const dropZoneStyle: React.CSSProperties = {
  flex: 2,
  minWidth: '320px',
  padding: '2rem',
  borderRadius: '12px',
  border: '2px dashed var(--border)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const dropZoneText: React.CSSProperties = {
  fontSize: '0.95rem',
  marginBottom: '0.4rem',
  textAlign: 'center',
  color: 'var(--text-primary)',
};

const dropZoneSubtext: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
};

const controlPanelStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '240px',
  padding: '1.5rem',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const controlTitle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: '600',
  marginBottom: '1rem',
  color: 'var(--text-primary)',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const baseBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const btnTemplateStyle: React.CSSProperties = {
  ...baseBtnStyle,
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  color: '#60a5fa',
  border: '1px solid rgba(59, 130, 246, 0.2)',
};

const btnDummyStyle: React.CSSProperties = {
  ...baseBtnStyle,
  backgroundColor: 'var(--accent-light)',
  color: 'var(--accent)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
};

const btnDeleteStyle: React.CSSProperties = {
  ...baseBtnStyle,
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  color: '#f87171',
  border: '1px solid rgba(239, 68, 68, 0.2)',
};

const filterBarContainer: React.CSSProperties = {
  padding: '1rem',
  borderRadius: '12px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.2rem',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const searchWrapper: React.CSSProperties = {
  position: 'relative',
  flex: 1.5,
  minWidth: '280px',
};

const searchIcon: React.CSSProperties = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  paddingLeft: '2.5rem',
};

const filterSelectGroup: React.CSSProperties = {
  display: 'flex',
  gap: '1.2rem',
  flexWrap: 'wrap',
  flex: 1,
  justifyContent: 'flex-end',
  minWidth: '320px',
};

const selectWrapper: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const selectLabel: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
};

const selectStyle: React.CSSProperties = {
  padding: '0.45rem 1.5rem 0.45rem 0.75rem',
  fontSize: '0.8rem',
};

const tableContainerStyle: React.CSSProperties = {
  borderRadius: '12px',
  overflow: 'hidden',
};

const tableHeaderRow: React.CSSProperties = {
  padding: '1.2rem 1.5rem',
  borderBottom: '1px solid var(--border)',
};

const tableWrapper: React.CSSProperties = {
  overflowX: 'auto',
  width: '100%',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
};

const thRowStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-secondary)',
  borderBottom: '1px solid var(--border)',
};

const thStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  fontSize: '0.8rem',
  fontWeight: '600',
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const trStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border)',
  transition: 'background-color 0.2s',
  backgroundColor: 'transparent',
};

const tdStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  fontSize: '0.85rem',
  color: 'var(--text-primary)',
};

const tdCodeStyle: React.CSSProperties = {
  ...tdStyle,
  fontFamily: 'monospace',
  fontWeight: '600',
  color: 'var(--accent)',
  letterSpacing: '0.5px',
};

const tdNameStyle: React.CSSProperties = {
  ...tdStyle,
  fontWeight: '700',
};

const tdOrgStyle: React.CSSProperties = {
  ...tdStyle,
  color: 'var(--text-primary)',
};

const tdPosStyle: React.CSSProperties = {
  ...tdStyle,
  color: 'var(--text-secondary)',
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
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
  };
};

const regBadgeStyle = (regType: '사전' | '현장'): React.CSSProperties => ({
  fontSize: '0.75rem',
  padding: '0.15rem 0.5rem',
  borderRadius: '4px',
  fontWeight: '600',
  backgroundColor: regType === '사전' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(248, 113, 113, 0.1)',
  color: regType === '사전' ? '#60a5fa' : '#f87171',
});

const statusAttendedStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'var(--accent)',
  fontWeight: '500',
  fontSize: '0.8rem',
};

const statusAbsentStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: 'var(--text-muted)',
  fontSize: '0.8rem',
};

const statusDot = (isActive: boolean): React.CSSProperties => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: isActive ? 'var(--accent)' : 'var(--text-muted)',
  display: 'inline-block',
});

const printCountBadge: React.CSSProperties = {
  backgroundColor: 'var(--accent-light)',
  color: 'var(--accent)',
  padding: '0.1rem 0.4rem',
  borderRadius: '3px',
  fontSize: '0.75rem',
};

const btnPrintRowStyle: React.CSSProperties = {
  backgroundColor: 'var(--accent)',
  color: '#ffffff',
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: '600',
  display: 'inline-flex',
  alignItems: 'center',
};

const emptyCellstyle: React.CSSProperties = {
  padding: '4rem 0',
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: '0.9rem',
};
