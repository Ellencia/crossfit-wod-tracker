import React, { useState } from 'react';
import { MUSCLE_KO } from './muscleTooltip';
import './Calendar.css';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MODE_LABEL = { db: 'DB', ai: 'Groq AI', local: '로컬 AI' };
const INTENSITY_LABEL = { high: '고강도', medium: '중강도', low: '저강도' };

const INTENSITY_COLOR = { high: '#ef4444', medium: '#f97316', low: '#22c55e' };

function renderBold(text, muscles) {
  if (!text) return null;
  const intensityMap = {};
  (muscles || []).forEach(m => {
    const name = (m.name || '').replace(/\*\*/g, '').trim();
    if (name) intensityMap[name] = m.intensity;
    (m.muscleIds || []).forEach(id => {
      const canonical = MUSCLE_KO[id];
      if (canonical) intensityMap[canonical] = m.intensity;
    });
  });
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (!part.startsWith('**') || !part.endsWith('**')) return part;
    const inner = part.slice(2, -2);
    const color = INTENSITY_COLOR[intensityMap[inner]];
    return <strong key={i} style={color ? { color } : undefined}>{inner}</strong>;
  });
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function Calendar({ records, onDelete }) {
  const today = new Date();
  const todayKey = toDateKey(today);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const record = selectedKey ? records[selectedKey] : null;

  return (
    <div className="calendar-section">
      {/* ── 월 이동 ── */}
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="이전 달">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="cal-nav-title">{year}년 {month + 1}월</span>
        <button className="cal-nav-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="다음 달">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── 달력 그리드 ── */}
      <div className="cal-grid">
        {WEEKDAYS.map(w => (
          <div key={w} className="cal-weekday">{w}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="cal-cell empty" />;
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const has = !!records[key];
          const isToday = key === todayKey;
          const isSel = key === selectedKey;
          return (
            <div
              key={key}
              className={`cal-cell${has ? ' has-record' : ''}${isToday ? ' today' : ''}${isSel ? ' selected' : ''}`}
              onClick={() => setSelectedKey(isSel ? null : key)}
            >
              <span className="cal-day-num">{day}</span>
              {has && <span className="cal-dot" />}
            </div>
          );
        })}
      </div>

      {/* ── 기록 상세 ── */}
      {record && (
        <div className="cal-detail">
          <div className="cal-detail-header">
            <div className="cal-detail-date">
              {selectedKey}
              <span className={`cal-mode-badge mode-${record.mode}`}>{MODE_LABEL[record.mode] || record.mode}</span>
            </div>
            <button
              className="cal-delete-btn"
              onClick={() => { onDelete(selectedKey); setSelectedKey(null); }}
            >
              삭제
            </button>
          </div>

          {record.wodText && (
            <div className="cal-wod-text">
              <div className="cal-section-label">WOD</div>
              <p>{record.wodText}</p>
            </div>
          )}

          <div className="cal-muscles">
            <div className="cal-section-label">자극 근육</div>
            <div className="cal-muscle-groups">
              {['high', 'medium', 'low'].map(intensity => {
                const group = (record.muscles || []).filter(m => m.intensity === intensity);
                if (!group.length) return null;
                return (
                  <div key={intensity} className={`cal-muscle-group ${intensity}`}>
                    <span className="cal-intensity-label">{INTENSITY_LABEL[intensity]}</span>
                    {group.map(m => (
                      <span key={m.muscleIds?.[0] || m.name} className="cal-muscle-tag">{(m.name || '').replace(/\*\*/g, '')}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 중량 */}
          {record.weights && Object.keys(record.weights).length > 0 && (
            <div className="cal-perf">
              <div className="cal-section-label">중량</div>
              {'__text' in record.weights
                ? <p className="cal-perf-text">{record.weights.__text}</p>
                : (
                  <div className="cal-set-list">
                    {Object.entries(record.weights).map(([id, sets]) => (
                      <div key={id} className="cal-set-exercise">
                        <span className="cal-set-exname">
                          {record.exerciseNames?.[id] || id}
                        </span>
                        <div className="cal-set-tags">
                          {(sets || []).map((s, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="cal-set-sep">/</span>}
                              <span className="cal-set-tag">
                                {i + 1}세트&nbsp;
                                {s.reps && <strong>{s.reps}회</strong>}
                                {s.reps && s.weight && ' × '}
                                {s.weight && <strong>{s.weight}kg</strong>}
                              </span>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* 완료 시간 */}
          {record.completionTime && (
            <div className="cal-perf">
              <div className="cal-section-label">완료 시간</div>
              <span className="cal-time">{record.completionTime}</span>
            </div>
          )}

          {/* 메모 */}
          {record.note && (
            <div className="cal-perf">
              <div className="cal-section-label">메모</div>
              <p className="cal-perf-text">{record.note}</p>
            </div>
          )}

          {record.summary && (
            <div className="cal-summary">
              <div className="cal-section-label">총평</div>
              <p>{renderBold(record.summary, record.muscles)}</p>
            </div>
          )}
        </div>
      )}

      {Object.keys(records).length === 0 && (
        <p className="cal-empty-msg">아직 저장된 기록이 없습니다. 운동 분석 후 기록을 저장해보세요.</p>
      )}
    </div>
  );
}
