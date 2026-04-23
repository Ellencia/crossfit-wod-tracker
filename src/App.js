import React, { useState } from 'react';
import Model from 'react-body-highlighter';
import { EXERCISES, CATEGORIES, PATTERNS, combineExercises } from './exerciseDB';
import { getRecoveryAdvice } from './recoveryDB';
import { getMuscleFromPoints, MUSCLE_KO } from './muscleTooltip';
import { callLocalOnce, aggregate } from './analyzeUtils';
import { useWodStorage, toDateKey } from './useWodStorage';
import Calendar from './Calendar';
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

  // AI / 로컬 모드 공유 상태
  const [wod, setWod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localUrl, setLocalUrl] = useState('http://localhost:1234');

  // DB 모드 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedPattern, setSelectedPattern] = useState('전체');
  const [selectedIds, setSelectedIds] = useState([]);

  const [result, setResult] = useState(null);
  const [tooltip, setTooltip] = useState(null); // { x, y, name }
  const [recoveryTab, setRecoveryTab] = useState('stretch');

  // 앱 뷰 & 달력 저장
  const [appView, setAppView] = useState('analyze');
  const { records, saveRecord, deleteRecord } = useWodStorage();
  const [savedKey, setSavedKey] = useState(null);
  const [saveDate, setSaveDate] = useState(toDateKey());

  // 퍼포먼스 기록
  // DB 모드: { [exId]: [{reps:'5', weight:'60'}, ...] }
  // AI 모드: { __text: '...' }
  const [weights, setWeights] = useState({});
  const [compMin, setCompMin] = useState('');
  const [compSec, setCompSec] = useState('');
  const [perfNote, setPerfNote] = useState('');

  const addSet = (exId) =>
    setWeights(prev => ({ ...prev, [exId]: [...(prev[exId] || []), { reps: '', weight: '' }] }));

  const removeSet = (exId, idx) =>
    setWeights(prev => ({ ...prev, [exId]: prev[exId].filter((_, i) => i !== idx) }));

  const updateSet = (exId, idx, field, value) =>
    setWeights(prev => {
      const sets = [...(prev[exId] || [])];
      sets[idx] = { ...sets[idx], [field]: value };
      return { ...prev, [exId]: sets };
    });

  const stepSet = (exId, idx, field, delta) => {
    const sets = weights[exId] || [];
    const cur = parseFloat(sets[idx]?.[field] || '0');
    const next = Math.max(0, cur + delta);
    updateSet(exId, idx, field, String(next));
  };

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

  // ── 로컬 AI 분석 ─────────────────────────────────────────
  const analyzeLocal = async () => {
    if (!wod.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const settled = await Promise.allSettled(
        Array.from({ length: 5 }, () => callLocalOnce(wod, localUrl))
      );
      const results = settled.filter(r => r.status === 'fulfilled').map(r => r.value);
      if (!results.length) throw new Error('모든 요청 실패 — LM Studio가 실행 중인지 확인해주세요.');
      setResult(aggregate(results));
    } catch (err) {
      setError(`로컬 AI 오류: ${err.message}`);
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
    const matchCat = filterMode === 'category'
      ? (selectedCategory === '전체' || e.category === selectedCategory)
      : (selectedPattern === '전체' || e.pattern === selectedPattern);
    const q = searchQuery.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.nameKo.includes(q);
    return matchCat && matchQ;
  });

  // **text** → <strong> 렌더링
  const renderBold = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  // ── WOD 저장 ─────────────────────────────────────────────
  const saveToday = () => {
    const wodText = mode === 'db'
      ? EXERCISES.filter(e => selectedIds.includes(e.id)).map(e => e.nameKo).join(', ')
      : wod;
    const completionTime = (compMin || compSec)
      ? `${(compMin || '0').padStart(2,'0')}:${(compSec || '0').padStart(2,'0')}`
      : '';
    const exerciseNames = mode === 'db'
      ? Object.fromEntries(EXERCISES.filter(e => selectedIds.includes(e.id)).map(e => [e.id, e.nameKo]))
      : {};
    // 빈 세트 행 제거
    const cleanWeights = mode === 'db'
      ? Object.fromEntries(
          Object.entries(weights).map(([id, sets]) => [
            id, (sets || []).filter(s => s.reps || s.weight)
          ]).filter(([, sets]) => sets.length > 0)
        )
      : weights;
    saveRecord(saveDate, {
      wodText, muscles: result.muscles, summary: result.summary, mode,
      weights: cleanWeights, exerciseNames, completionTime, note: perfNote,
    });
    setSavedKey(saveDate);
  };

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

      {/* ── 상단 탭 ── */}
      <div className="app-nav">
        <button
          className={`app-nav-btn ${appView === 'analyze' ? 'active' : ''}`}
          onClick={() => setAppView('analyze')}
        >
          운동 분석
        </button>
        <button
          className={`app-nav-btn ${appView === 'calendar' ? 'active' : ''}`}
          onClick={() => setAppView('calendar')}
        >
          기록 달력
          {Object.keys(records).length > 0 && (
            <span className="nav-record-count">{Object.keys(records).length}</span>
          )}
        </button>
      </div>

      {/* ── 달력 뷰 ── */}
      {appView === 'calendar' && (
        <Calendar records={records} onDelete={deleteRecord} />
      )}

      <main className="app-main" style={{ display: appView === 'calendar' ? 'none' : undefined }}>
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
              Groq AI
            </button>
            <button
              className={`mode-btn ${mode === 'local' ? 'active' : ''}`}
              onClick={() => { setMode('local'); setResult(null); setError(''); }}
            >
              로컬 AI
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
                <div className="filter-mode-toggle">
                  <button
                    className={`filter-mode-btn ${filterMode === 'category' ? 'active' : ''}`}
                    onClick={() => setFilterMode('category')}
                  >
                    장비
                  </button>
                  <button
                    className={`filter-mode-btn ${filterMode === 'pattern' ? 'active' : ''}`}
                    onClick={() => setFilterMode('pattern')}
                  >
                    동작 패턴
                  </button>
                </div>
                {filterMode === 'category' ? (
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
                ) : (
                  <div className="category-tabs">
                    {PATTERNS.map(pat => (
                      <button
                        key={pat}
                        className={`cat-btn ${selectedPattern === pat ? 'active' : ''}`}
                        onClick={() => setSelectedPattern(pat)}
                      >
                        {pat}
                      </button>
                    ))}
                  </div>
                )}
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
                {loading ? 'Groq AI 분석 중... (5회 집계)' : '근육 분석하기'}
              </button>
            </div>
          )}

          {/* 로컬 AI 모드 */}
          {mode === 'local' && (
            <div className="ai-mode">
              {window.location.protocol === 'https:' && (
                <div className="local-https-warning">
                  ⚠️ HTTPS 환경에서는 브라우저 보안 정책으로 로컬 AI 접근이 차단됩니다.
                  로컬에서 앱을 직접 실행한 뒤 <strong>http://localhost:3000</strong>으로 접속하여 사용하세요.
                </div>
              )}
              <div className="local-url-row">
                <span className="sample-label">서버 주소:</span>
                <input
                  className="search-input local-url-input"
                  type="text"
                  value={localUrl}
                  onChange={e => setLocalUrl(e.target.value)}
                  placeholder="http://localhost:1234"
                  spellCheck={false}
                />
              </div>
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
                onClick={analyzeLocal}
                disabled={loading || !wod.trim()}
              >
                {loading ? '로컬 AI 분석 중... (5회 집계)' : '근육 분석하기'}
              </button>
            </div>
          )}
        </section>

        {error && <div className="error-box">{error}</div>}

        {result && (
          <section className="result-section">
            <div
              className="model-container"
              onMouseMove={(e) => {
                if (e.target.tagName === 'polygon') {
                  const muscle = getMuscleFromPoints(e.target.getAttribute('points'));
                  const name = muscle ? (MUSCLE_KO[muscle] || muscle) : null;
                  if (name) {
                    setTooltip({ x: e.clientX, y: e.clientY, name });
                    return;
                  }
                }
                setTooltip(null);
              }}
              onMouseLeave={() => setTooltip(null)}
            >
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
                <p>{renderBold(result.summary)}</p>
              </div>
            )}

            {result.muscles?.length > 0 && (() => {
              const advice = getRecoveryAdvice(result.muscles);
              if (!advice.length) return null;
              const TABS = [
                { key: 'stretch',    icon: '🤸', label: '스트레칭' },
                { key: 'foamRoller', icon: '🪵', label: '폼롤러' },
                { key: 'massageGun', icon: '🔫', label: '마사지건' },
              ];
              return (
                <div className="recovery-box">
                  <div className="recovery-header">
                    <h3>회복 권장사항</h3>
                    <div className="recovery-tabs">
                      {TABS.map(t => (
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
                    {advice.map(({ id, muscle, info }) => (
                      <div key={id} className="recovery-item">
                        <div className="recovery-muscle">
                          <span className={`recovery-badge ${muscle?.intensity}`}>{muscle?.intensity === 'high' ? '고강도' : '중강도'}</span>
                          <span className="recovery-muscle-name">{info.name}</span>
                        </div>
                        <div className="recovery-method">
                          <span className="method-icon">
                            {TABS.find(t => t.key === recoveryTab)?.icon}
                          </span>
                          <span>{info[recoveryTab]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* ── 저장 버튼 ── */}
        {result && (
          <div className="save-panel">
            <div className="save-panel-title">📅 기록 저장</div>

            {/* 날짜 */}
            <div className="save-row">
              <span className="save-field-label">날짜</span>
              <input
                type="date"
                className="save-date-input"
                value={saveDate}
                max={toDateKey()}
                onChange={e => { setSaveDate(e.target.value); setSavedKey(null); }}
              />
            </div>

            {/* 운동별 세트 테이블 (DB 모드) */}
            {mode === 'db' && selectedIds.length > 0 && (
              <div className="save-set-tables">
                {EXERCISES.filter(e => selectedIds.includes(e.id)).map(ex => {
                  const sets = weights[ex.id] || [];
                  return (
                    <div key={ex.id} className="set-table">
                      <div className="set-table-header">{ex.nameKo}</div>

                      {sets.length > 0 && (
                        <div className="set-table-rows">
                          <div className="set-row set-row-head">
                            <span className="set-num-col" />
                            <span className="set-col-label">횟수</span>
                            <span className="set-col-label">중량</span>
                            <span style={{width:24}} />
                          </div>
                          {sets.map((s, i) => (
                            <div key={i} className="set-row">
                              <span className="set-num-col">{i + 1}</span>
                              <div className="spinner-group">
                                <button className="spinner-btn" onClick={() => stepSet(ex.id, i, 'reps', -1)}>−</button>
                                <input
                                  type="text" inputMode="numeric"
                                  className="set-input"
                                  placeholder="0"
                                  value={s.reps}
                                  onChange={e => updateSet(ex.id, i, 'reps', e.target.value)}
                                />
                                <button className="spinner-btn" onClick={() => stepSet(ex.id, i, 'reps', 1)}>+</button>
                              </div>
                              <div className="spinner-group">
                                <button className="spinner-btn" onClick={() => stepSet(ex.id, i, 'weight', -2.5)}>−</button>
                                <input
                                  type="text" inputMode="decimal"
                                  className="set-input set-input-wide"
                                  placeholder="0"
                                  value={s.weight}
                                  onChange={e => updateSet(ex.id, i, 'weight', e.target.value)}
                                />
                                <button className="spinner-btn" onClick={() => stepSet(ex.id, i, 'weight', 2.5)}>+</button>
                              </div>
                              <span className="set-unit">kg</span>
                              <button className="set-remove-btn" onClick={() => removeSet(ex.id, i)}>×</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <button className="set-add-btn" onClick={() => addSet(ex.id)}>
                        + 세트 추가
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* AI/로컬 모드 중량 메모 */}
            {mode !== 'db' && (
              <div className="save-row">
                <span className="save-field-label">중량 메모</span>
                <input
                  type="text"
                  className="save-text-input"
                  placeholder="예) Thruster 43kg, DL 100kg"
                  value={weights.__text || ''}
                  onChange={e => setWeights({ __text: e.target.value })}
                />
              </div>
            )}

            {/* 완료 시간 */}
            <div className="save-row">
              <span className="save-field-label">완료 시간</span>
              <div className="time-inputs">
                <div className="spinner-group">
                  <button className="spinner-btn" onClick={() => setCompMin(v => String(Math.max(0, Number(v||0) - 1)))}>−</button>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="time-input"
                    placeholder="분"
                    min="0" max="99"
                    value={compMin}
                    onChange={e => setCompMin(e.target.value)}
                  />
                  <button className="spinner-btn" onClick={() => setCompMin(v => String(Number(v||0) + 1))}>+</button>
                </div>
                <span className="time-sep">:</span>
                <div className="spinner-group">
                  <button className="spinner-btn" onClick={() => setCompSec(v => String(Math.min(59, Math.max(0, Number(v||0) - 1))))}>−</button>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="time-input"
                    placeholder="초"
                    min="0" max="59"
                    value={compSec}
                    onChange={e => setCompSec(e.target.value)}
                  />
                  <button className="spinner-btn" onClick={() => setCompSec(v => String(Math.min(59, Number(v||0) + 1)))}>+</button>
                </div>
              </div>
            </div>

            {/* 메모 */}
            <div className="save-row save-note-row">
              <span className="save-field-label">메모</span>
              <textarea
                className="save-note-input"
                placeholder="컨디션, 스케일링 내용, 느낀 점 등"
                rows={2}
                value={perfNote}
                onChange={e => setPerfNote(e.target.value)}
              />
            </div>

            {/* 저장 버튼 */}
            <div className="save-actions">
              {savedKey === saveDate ? (
                <span className="save-done">✓ {savedKey} 저장 완료</span>
              ) : (
                <button className="save-btn" onClick={saveToday}>저장하기</button>
              )}
            </div>
          </div>
        )}
      </main>
      {tooltip && (
        <div
          className="muscle-tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}

export default App;
