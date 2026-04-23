export const VALID_MUSCLE_IDS = new Set([
  'trapezius', 'upper-back', 'lower-back',
  'chest', 'biceps', 'triceps',
  'forearm', 'back-deltoids', 'front-deltoids',
  'abs', 'obliques',
  'adductor', 'hamstring', 'quadriceps',
  'abductors', 'calves', 'gluteal',
  'head', 'tibialis',
]);

export const SYSTEM_PROMPT = `You are an elite CrossFit coach and sports physiologist. Analyze the WOD and respond ONLY in JSON format.

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
  중요: 근육 이름(예: 대퇴사두근, 햄스트링)과 운동 이름(예: Thruster, Pull-up)은 반드시 **굵게** 표시하라.

Allowed muscleIds: ${[...VALID_MUSCLE_IDS].join(', ')}

intensity values: "high" (주동근, 고중량 주도근), "medium" (보조근, 협력근), "low" (안정화근, 코어 지지)`;

const INTENSITY_SCORE = { high: 3, medium: 2, low: 1 };

export function aggregate(results) {
  const votes = {};

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
    .filter(([, v]) => v.total >= 2)
    .map(([id, v]) => {
      const score = (v.high * 3 + v.medium * 2 + v.low * 1) / v.total;
      let intensity = score >= 2.5 ? 'high' : score >= 1.5 ? 'medium' : 'low';
      if (v.total === 2) intensity = 'low';

      const nameCounts = {};
      v.names.forEach(n => { nameCounts[n] = (nameCounts[n] || 0) + 1; });
      const name = Object.entries(nameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || id;

      return { name, muscleIds: [id], intensity, confidence: v.total };
    })
    .sort((a, b) => INTENSITY_SCORE[b.intensity] - INTENSITY_SCORE[a.intensity]);

  const bestSummary = results
    .map(r => r.summary || '')
    .reduce((best, s) => s.length > best.length ? s : best, '');

  return {
    muscles,
    summary: bestSummary || results[0]?.summary || '',
    recovery: results[0]?.recovery || '',
    meta: { runs: results.length, aggregated: true },
  };
}

export async function callLocalOnce(wod, baseUrl = 'http://localhost:1234') {
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        // /no_thinking → Qwen3 계열 모델의 thinking 모드 비활성화
        { role: 'user', content: `WOD: ${wod}\n/no_thinking` },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });
  if (!res.ok) throw new Error(`Local AI error: ${res.status}`);
  const data = await res.json();
  const msg = data.choices[0].message;
  // content가 비어있으면 reasoning_content에서 JSON 추출 시도
  let text = (msg.content?.trim() || msg.reasoning_content?.trim() || '');
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (!objMatch) throw new Error('No JSON found');
  return JSON.parse(objMatch[0]);
}
