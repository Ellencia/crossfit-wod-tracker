import React, { useState } from 'react';
import Body from 'react-muscle-highlighter';
import { calcFatigue, getFatigueLevel, FATIGUE_LEVELS } from './fatigueUtils';
import { MUSCLE_KO } from './muscleTooltip';
import { getRecoveryAdvice } from './recoveryDB';
import './FatigueView.css';

const SLUG_MAP = { 'front-deltoids': 'deltoids', 'back-deltoids': 'deltoids', adductor: 'adductors' };

const RECOVERY_TABS = [
  { key: 'stretch',    icon: '🤸', label: '스트레칭' },
  { key: 'foamRoller', icon: '🪵', label: '폼롤러'   },
  { key: 'massageGun', icon: '🔫', label: '마사지건'  },
];

export default function FatigueView({ records }) {
  const [recoveryTab, setRecoveryTab] = useState('stretch');

  if (!Object.keys(records).length) {
    return <p className="fatigue-empty">저장된 운동 기록이 없습니다. 운동 분석 후 기록을 저장해보세요.</p>;
  }

  const fatigueScores = calcFatigue(records);
  const sortedMuscles = Object.entries(fatigueScores)
    .map(([id, score]) => ({ id, score, level: getFatigueLevel(score) }))
    .sort((a, b) => b.score - a.score);

  if (!sortedMuscles.length) {
    return <p className="fatigue-empty">최근 7일 내 운동 기록이 없습니다.</p>;
  }

  // Body 맵 데이터 — 같은 slug는 높은 피로도 우선
  const slugMap = new Map();
  sortedMuscles.forEach(({ id, level }) => {
    const slug = SLUG_MAP[id] || id;
    if (!slugMap.has(slug)) slugMap.set(slug, level.color);
  });
  const bodyData = [...slugMap.entries()].map(([slug, color]) => ({ slug, color }));

  // 회복 권장 — 피로 이상 근육 대상
  const tiredMuscles = sortedMuscles
    .filter(m => m.score >= 1.5)
    .slice(0, 5)
    .map(m => ({ muscleIds: [m.id], intensity: m.score >= 5.5 ? 'high' : 'medium', name: MUSCLE_KO[m.id] || m.id }));
  const recoveryAdvice = getRecoveryAdvice(tiredMuscles);

  const maxScore = Math.max(...sortedMuscles.map(m => m.score), 1);

  return (
    <div className="fatigue-section">
      <div className="fatigue-body-row">
        <div className="fatigue-body-col">
          <span className="fatigue-body-label">앞면</span>
          <Body data={bodyData} side="front" gender="male" scale={1.0} defaultFill="#2a2a2a" border="#444" />
        </div>
        <div className="fatigue-body-col">
          <span className="fatigue-body-label">뒷면</span>
          <Body data={bodyData} side="back" gender="male" scale={1.0} defaultFill="#2a2a2a" border="#444" />
        </div>
        <div className="fatigue-legend">
          <p className="fatigue-legend-title">피로도</p>
          {FATIGUE_LEVELS.map(l => (
            <div key={l.key} className="fatigue-legend-item">
              <span className="fatigue-legend-dot" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
          <p className="fatigue-legend-note">최근 7일 기록 기준</p>
        </div>
      </div>

      {/* 근육별 피로 바 */}
      <div className="fatigue-list">
        {sortedMuscles.map(({ id, score, level }) => (
          <div key={id} className="fatigue-item">
            <span className="fatigue-muscle-name">{MUSCLE_KO[id] || id}</span>
            <div className="fatigue-bar-wrap">
              <div
                className="fatigue-bar"
                style={{ width: `${(score / maxScore) * 100}%`, background: level.color }}
              />
            </div>
            <span className="fatigue-level-badge" style={{ color: level.color }}>{level.label}</span>
          </div>
        ))}
      </div>

      {/* 회복 권장 */}
      {recoveryAdvice.length > 0 && (
        <div className="fatigue-recovery">
          <div className="fatigue-recovery-header">
            <h3>회복 권장사항</h3>
            <div className="recovery-tabs">
              {RECOVERY_TABS.map(t => (
                <button
                  key={t.key}
                  className={`recovery-tab-btn ${recoveryTab === t.key ? 'active' : ''}`}
                  onClick={() => setRecoveryTab(t.key)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="recovery-grid">
            {recoveryAdvice.map(({ id, muscle, info }) => (
              <div key={id} className="recovery-item">
                <div className="recovery-muscle">
                  <span className={`recovery-badge ${muscle?.intensity}`}>
                    {muscle?.intensity === 'high' ? '과부하' : '피로'}
                  </span>
                  <span className="recovery-muscle-name">{info.name}</span>
                </div>
                <div className="recovery-method">
                  <span className="method-icon">{RECOVERY_TABS.find(t => t.key === recoveryTab)?.icon}</span>
                  <span>{info[recoveryTab]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
