import React, { useState } from 'react';
import Model from 'react-body-highlighter';
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
  const [wod, setWod] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyzeWOD = async () => {
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

  const getHighlightData = () => {
    if (!result) return [];
    console.log('muscles:', JSON.stringify(result.muscles));
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
          <div className="sample-buttons">
            <span className="sample-label">샘플 WOD:</span>
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
            placeholder={"오늘의 WOD를 입력하세요\n예) Fran: 21-15-9 Thrusters (43kg), Pull-ups\n예) AMRAP 20min - 5 Pull-ups, 10 Push-ups, 15 Air Squats"}
            rows={4}
          />
          <button
            className="analyze-btn"
            onClick={analyzeWOD}
            disabled={loading || !wod.trim()}
          >
            {loading ? '분석 중...' : '근육 분석하기'}
          </button>
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
