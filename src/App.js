import React, { useState } from 'react';
import Model from 'react-body-highlighter';
import { EXERCISES, CATEGORIES, combineExercises } from './exerciseDB';
import './App.css';

const SAMPLE_WODS = [
  "Fran: 21-15-9 Thrusters (43kg), Pull-ups",
  "Cindy: AMRAP 20min - 5 Pull-ups, 10 Push-ups, 15 Air Squats",
  "Murph: 1mile Run, 100 Pull-ups, 200 Push-ups, 300 Air Squats, 1mile Run",
  "Grace: 30 Clean & Jerks (61kg) for time",
];

const VALID_MUSCLE_IDS = new Set([
  'trapezius', 'upper-back', 'lower-back',
  'chest', 'biceps', 'triceps',
  'forearm', 'back-deltoids', 'front-deltoids',
  'abs', 'obliques',
  'adductor', 'hamstring', 'quadriceps',
  'abductors', 'calves', 'gluteal',
  'head', 'tibialis',
]);

function App() {
  const [mode, setMode] = useState('db');

  // AI 모드 상태
  const [wod, setWod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // DB 모드 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedIds, setSelectedIds] = useState([]);

  const [result, setResult] = useState(null);

  // ── AI 분석 ──────────────────────────────────────────────
  const analyzeAI = async () => {
    if (!wod.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wod }),
      });
      if (!response.ok) throw new Error('분석 실패');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('분석 중 오류가 발생했습니다. API 서버를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // ── DB 분석 ──────────────────────────────────────────────
  const analyzeDB = () => {
    if (!selectedIds.length) return;
    const selected = EXERCISES.filter(e => selectedIds.includes(e.id));
    const muscles = combineExercises(selected);
    const names = selected.map(e => e.nameKo).join(', ');
    setResult({
      muscles,
      summary: `선택한 운동: ${names}. 총 ${selected.length}가지 동작으로 구성된 운동입니다.`,
      recovery: '운동 후 충분한 스트레칭과 수분 섭취를 권장합니다. 고강도 부위는 48~72시간 휴식을 권장합니다.',
    });
  };

  const toggleExercise = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setResult(null);
  };

  const filteredExercises = EXERCISES.filter(e => {
    const matchCat = selectedCategory === '전체' || e.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.nameKo.includes(q);
    return matchCat && matchQ;
  });

  // ── 시각화 데이터 ─────────────────────────────────────────
  const getHighlightData = () => {
    if (!result) return [];
    const groups = { high: [], medium: [], low: [] };
    result.muscles.forEach(m => {
      const key = (m.intensity || '').toLowerCase();
      const validIds = (m.muscleIds || []).filter(id => VALID_MUSCLE_IDS.has(id));
      (groups[key] || groups.low).push(...validIds);
    });
    return [
      { name: 'high',   muscles: groups.high,   frequency: 1 },
      { name: 'medium', muscles: groups.medium, frequency: 2 },
      { name: 'low',    muscles: groups.low,    frequency: 3 },
    ].filter(g => g.muscles.length > 0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>CrossFit WOD Muscle Analyzer</h1>
        <p>오늘의 WOD를 입력하면 자극받는 근육 부위를 시각화해드립니다</p>
      </header>

      <main className="app-main">
        <section className="input-section">
          {/* 모드 토글 */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'db' ? 'active' : ''}`}
              onClick={() => { setMode('db'); setResult(null); setError(''); }}
            >
              DB 모드
            </button>
            <button
              className={`mode-btn ${mode === 'ai' ? 'active' : ''}`}
              onClick={() => { setMode('ai'); setResult(null); setError(''); }}
            >
              AI 모드
            </button>
          </div>

          {/* DB 모드 */}
          {mode === 'db' && (
            <div className="db-mode">
              <div className="db-controls">
                <input
                  className="search-input"
                  type="text"
                  placeholder="운동 검색 (예: clean, 스쿼트)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="category-tabs">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="exercise-grid">
                {filteredExercises.map(ex => (
                  <button
                    key={ex.id}
                    className={`exercise-btn ${selectedIds.includes(ex.id) ? 'selected' : ''}`}
                    onClick={() => toggleExercise(ex.id)}
                  >
                    <span className="ex-name">{ex.name}</span>
                    <span className="ex-name-ko">{ex.nameKo}</span>
                  </button>
                ))}
              </div>

              {selectedIds.length > 0 && (
                <div className="selected-list">
                  <span className="selected-label">선택됨:</span>
                  {EXERCISES.filter(e => selectedIds.includes(e.id)).map(e => (
                    <span key={e.id} className="selected-tag" onClick={() => toggleExercise(e.id)}>
                      {e.nameKo} ✕
                    </span>
                  ))}
                </div>
              )}

              <button
                className="analyze-btn"
                onClick={analyzeDB}
                disabled={!selectedIds.length}
              >
                근육 분석하기
              </button>
            </div>
          )}

          {/* AI 모드 */}
          {mode === 'ai' && (
            <div className="ai-mode">
              <div className="sample-buttons">
                <span className="sample-label">샘플:</span>
                {SAMPLE_WODS.map((s, i) => (
                  <button key={i} className="sample-btn" onClick={() => setWod(s)}>
                    {s.split(':')[0]}
                  </button>
                ))}
              </div>
              <textarea
                className="wod-input"
                value={wod}
                onChange={e => setWod(e.target.value)}
                placeholder={"오늘의 WOD를 입력하세요\n예) Fran: 21-15-9 Thrusters (43kg), Pull-ups"}
                rows={4}
              />
              <button
                className="analyze-btn"
                onClick={analyzeAI}
                disabled={loading || !wod.trim()}
              >
                {loading ? '분석 중...' : '근육 분석하기'}
              </button>
            </div>
          )}
        </section>

        {error && <div className="error-box">{error}</div>}

        {result && (
          <section className="result-section">
            <div className="model-container">
              <div className="model-view">
                <h3>앞면</h3>
                <Model
                  data={getHighlightData()}
                  highlightedColors={['#ef4444', '#f97316', '#22c55e']}
                  style={{ width: '180px' }}
                  type="anterior"
                />
              </div>
              <div className="model-view">
                <h3>뒷면</h3>
                <Model
                  data={getHighlightData()}
                  highlightedColors={['#ef4444', '#f97316', '#22c55e']}
                  style={{ width: '180px' }}
                  type="posterior"
                />
              </div>
            </div>

            <div className="legend">
              <span className="legend-item high">● 고강도</span>
              <span className="legend-item medium">● 중강도</span>
              <span className="legend-item low">● 저강도</span>
            </div>

            <div className="muscle-list">
              <h3>근육별 분석</h3>
              {['high', 'medium', 'low'].map(intensity => {
                const muscles = result.muscles.filter(m => m.intensity === intensity);
                if (!muscles.length) return null;
                const labels = { high: '고강도', medium: '중강도', low: '저강도' };
                return (
                  <div key={intensity} className={`intensity-group ${intensity}`}>
                    <h4>{labels[intensity]}</h4>
                    <div className="muscle-tags">
                      {muscles.map(m => (
                        <span key={m.name} className="muscle-tag">{m.name}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {result.summary && (
              <div className="summary-box">
                <h3>총평</h3>
                <p>{result.summary}</p>
              </div>
            )}

            {result.recovery && (
              <div className="recovery-box">
                <h3>회복 권장사항</h3>
                <p>{result.recovery}</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
