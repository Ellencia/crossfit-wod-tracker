const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const VALID_MUSCLE_IDS = new Set([
  'trapezius', 'upper-back', 'lower-back',
  'chest', 'biceps', 'triceps',
  'forearm', 'back-deltoids', 'front-deltoids',
  'abs', 'obliques',
  'adductor', 'hamstring', 'quadriceps',
  'abductors', 'calves', 'gluteal',
  'head', 'tibialis',
]);

const SYSTEM_PROMPT = `You are an elite CrossFit coach and sports physiologist. Analyze the WOD and respond ONLY in JSON format.

CRITICAL RULES:
1. Output raw JSON only — no markdown, no code blocks, no extra text
2. ALL text fields MUST be written in Korean (한국어)
3. "name" fields MUST be Korean muscle names (e.g. 대퇴사두근, 햄스트링, 삼두근, 복근)
4. muscleIds must ONLY use values from the allowed list
5. Be THOROUGH — list every muscle group involved, including stabilizers. Aim for 6-10 muscle entries.
6. Each entry should cover ONE muscle group only

JSON format:
{
  "muscles": [
    { "name": "한국어 근육명", "muscleIds": ["id1"], "intensity": "high" }
  ],
  "summary": "상세한 한국어 와드 평가 (아래 항목을 모두 포함, 각 항목은 줄바꿈 없이 이어서 서술)",
  "recovery": "한국어 회복 권장사항 1-2문장"
}

"summary" 작성 지침 — 반드시 다음 내용을 모두 포함하여 5문장 이상으로 작성하라:
  1. 와드 유형 및 구조 설명 (예: AMRAP, For Time, 라운드 구성 등)
  2. 핵심 자극 부위 및 주요 운동의 근육 동원 패턴
  3. 전체 강도·볼륨 평가 및 난이도 (초급/중급/고급)
  4. 권장 대상 선수 수준 및 스케일링 제안
  5. 운동 전략 또는 페이싱(pacing) 조언
  중요: 근육 이름(예: 대퇴사두근, 햄스트링)과 운동 이름(예: Thruster, Pull-up)은 반드시 **굵게** 표시하라. 예) **대퇴사두근**과 **햄스트링**을 집중 자극하며...

Allowed muscleIds: ${[...VALID_MUSCLE_IDS].join(', ')}

intensity values: "high" (주동근, 고중량 주도근), "medium" (보조근, 협력근), "low" (안정화근, 코어 지지)`;

const INTENSITY_SCORE = { high: 3, medium: 2, low: 1 };
const RUNS = 5;

async function callOnce(wod) {
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `WOD: ${wod}` },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });

  let text = completion.choices[0].message.content.trim();
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (!objMatch) throw new Error('No JSON found');
  return JSON.parse(objMatch[0]);
}

function aggregate(results) {
  // muscleId별 강도 투표 집계
  const votes = {}; // { muscleId: { high:n, medium:n, low:n, total:n, names:[] } }

  results.forEach(result => {
    (result.muscles || []).forEach(m => {
      const intensity = (m.intensity || '').toLowerCase();
      if (!INTENSITY_SCORE[intensity]) return;
      (m.muscleIds || []).forEach(id => {
        if (!VALID_MUSCLE_IDS.has(id)) return;
        if (!votes[id]) votes[id] = { high: 0, medium: 0, low: 0, total: 0, names: [] };
        votes[id][intensity]++;
        votes[id].total++;
        if (m.name) votes[id].names.push(m.name);
      });
    });
  });

  const muscles = Object.entries(votes)
    .filter(([, v]) => v.total >= 2) // 1/5는 제외
    .map(([id, v]) => {
      // 가중 평균으로 강도 결정
      const score = (v.high * 3 + v.medium * 2 + v.low * 1) / v.total;
      let intensity = score >= 2.5 ? 'high' : score >= 1.5 ? 'medium' : 'low';

      // 2/5는 최대 low로 제한
      if (v.total === 2) intensity = 'low';

      // 가장 많이 쓰인 한국어 이름 선택
      const nameCounts = {};
      v.names.forEach(n => { nameCounts[n] = (nameCounts[n] || 0) + 1; });
      const name = Object.entries(nameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || id;

      return { name, muscleIds: [id], intensity, confidence: v.total };
    })
    .sort((a, b) => INTENSITY_SCORE[b.intensity] - INTENSITY_SCORE[a.intensity]);

  // summary는 가장 긴 것, recovery는 첫 번째 성공 응답에서 가져옴
  const bestSummary = results
    .map(r => r.summary || '')
    .reduce((best, s) => s.length > best.length ? s : best, '');
  const first = results[0];
  return {
    muscles,
    summary: bestSummary || first?.summary || '',
    recovery: first?.recovery || '',
    meta: { runs: results.length, aggregated: true },
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { wod } = req.body;
  if (!wod) return res.status(400).json({ error: 'WOD is required' });

  try {
    // 5번 병렬 호출
    const settled = await Promise.allSettled(
      Array.from({ length: RUNS }, () => callOnce(wod))
    );

    const results = settled
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    console.log(`성공: ${results.length}/${RUNS}`);
    if (!results.length) throw new Error('모든 요청 실패');

    const data = aggregate(results);
    console.log(`집계 근육 수: ${data.muscles.length}, confidence 분포:`,
      data.muscles.map(m => `${m.name}(${m.confidence}/${RUNS})`).join(', ')
    );

    res.status(200).json(data);
  } catch (err) {
    console.error('API Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
