import { EXERCISES } from './exerciseDB';

const INTENSITY_SCORE = { high: 3, medium: 2, low: 1 };

// 날짜별 피로 감쇠 — 고강도 근육통은 48~72h, 7일 후 완전 회복
const DECAY_BY_DAY = [1.0, 0.80, 0.55, 0.32, 0.16, 0.07, 0.02];

export const FATIGUE_LEVELS = [
  { key: 'good',     label: '양호',   min: 0,   max: 1.5, color: '#22c55e' },
  { key: 'caution',  label: '주의',   min: 1.5, max: 3.0, color: '#eab308' },
  { key: 'tired',    label: '피로',   min: 3.0, max: 5.5, color: '#f97316' },
  { key: 'overload', label: '과부하', min: 5.5, max: Infinity, color: '#ef4444' },
];

export function getFatigueLevel(score) {
  return FATIGUE_LEVELS.find(l => score >= l.min && score < l.max) ?? FATIGUE_LEVELS[0];
}

// 해당 근육을 쓰는 운동의 총 볼륨(reps×kg) 계산 → 0~1 보너스
function calcVolumeBonus(record, muscleId) {
  const { weights } = record;
  if (!weights || weights.__text !== undefined) return 0;
  let vol = 0;
  Object.entries(weights).forEach(([exId, sets]) => {
    if (!Array.isArray(sets)) return;
    const ex = EXERCISES.find(e => e.id === exId);
    if (!ex || !ex.muscles[muscleId]) return;
    sets.forEach(s => {
      vol += (parseFloat(s.reps) || 0) * (parseFloat(s.weight) || 0);
    });
  });
  return Math.min(1.0, vol / 5000); // 5000kg = 보너스 100%
}

// records → { [muscleId]: fatigueScore }
export function calcFatigue(records) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date(todayStr);
  const fatigue = {};

  Object.entries(records).forEach(([dateKey, record]) => {
    const daysAgo = Math.round((today - new Date(dateKey)) / 86400000);
    const decay = daysAgo >= 0 && daysAgo < DECAY_BY_DAY.length ? DECAY_BY_DAY[daysAgo] : 0;
    if (decay === 0) return;

    (record.muscles || []).forEach(m => {
      const base = INTENSITY_SCORE[m.intensity] ?? 1;
      (m.muscleIds || []).forEach(id => {
        const bonus = calcVolumeBonus(record, id);
        fatigue[id] = (fatigue[id] || 0) + base * (1 + bonus) * decay;
      });
    });
  });

  return fatigue;
}

// 오늘 WOD 결과와 피로도를 비교해 주의 항목 반환
export function getWodWarnings(fatigueScores, resultMuscles) {
  const warnings = [];
  (resultMuscles || []).forEach(m => {
    (m.muscleIds || []).forEach(id => {
      const score = fatigueScores[id] || 0;
      const level = getFatigueLevel(score);
      if (score >= 5.5) {
        warnings.push({ id, name: m.name, score, level, wodIntensity: m.intensity });
      } else if (score >= 3.0 && m.intensity === 'high') {
        warnings.push({ id, name: m.name, score, level, wodIntensity: m.intensity });
      }
    });
  });
  return warnings.sort((a, b) => b.score - a.score);
}
