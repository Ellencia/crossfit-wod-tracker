import { EXERCISES } from './exerciseDB';
import { MUSCLE_KO } from './muscleTooltip';


export const VALID_MUSCLE_IDS = new Set([
  'trapezius', 'upper-back', 'lower-back',
  'chest', 'biceps', 'triceps',
  'forearm', 'deltoids',
  'abs', 'obliques',
  'adductors', 'hamstring', 'quadriceps',
  'abductors', 'calves', 'gluteal',
  'head', 'tibialis', 'neck',
]);

const EXERCISE_ALIASES = {
  clean: 'Clean',
  power_clean: 'Power Clean/PC',
  hang_clean: 'Hang Clean/HC',
  hang_power_clean: 'Hang Power Clean/HPC',
  power_snatch: 'Power Snatch/PS',
  hang_snatch: 'Hang Snatch/HS',
  clean_and_jerk: 'Clean & Jerk/C&J',
  push_jerk: 'Push Jerk/PJ',
  split_jerk: 'Split Jerk/SJ',
  overhead_squat: 'Overhead Squat/OHS',
  push_press: 'Push Press/PP',
  back_squat: 'Back Squat/BS',
  front_squat: 'Front Squat/FS',
  deadlift: 'Deadlift/DL',
  romanian_deadlift: 'Romanian Deadlift/RDL',
  sumo_deadlift: 'Sumo Deadlift/SDL',
  strict_press: 'Strict Press/Shoulder Press/SP',
  bench_press: 'Bench Press/BP',
  barbell_row: 'Barbell Row/BB Row',
  pendlay_row: 'Pendlay Row/P-row/P row',
  ctb_pullup: 'Chest-to-Bar Pull-up/CTB',
  bar_muscle_up: 'Bar Muscle-up/BMU',
  ring_muscle_up: 'Ring Muscle-up/RMU',
  toes_to_bar: 'Toes-to-Bar/T2B',
  knees_to_elbow: 'Knees-to-Elbow/K2E',
  double_under: 'Double Under/DU',
  rowing: 'Rowing/Row/Erg',
  assault_bike: 'Assault Bike/Echo Bike',
  kb_swing: 'Kettlebell Swing/KB Swing',
  turkish_getup: 'Turkish Get-up/TGU',
  db_snatch: 'Dumbbell Snatch/DB Snatch',
};

const EXERCISE_LIST = EXERCISES.map(e =>
  `${e.id}:${EXERCISE_ALIASES[e.id] || e.name}`
).join(', ');

export const SYSTEM_PROMPT = `You are an elite CrossFit coach and sports physiologist. Analyze the WOD and respond ONLY in JSON format.

CRITICAL RULES:
1. Output raw JSON only — no markdown, no code blocks, no extra text
2. ALL text fields MUST be written in Korean (한국어)
3. "name" fields MUST be Korean muscle names (e.g. 대퇴사두근, 햄스트링, 삼두근, 복근)
4. muscleIds must ONLY use values from the allowed list
5. Be THOROUGH — list every muscle group involved, including stabilizers. Aim for 6-10 muscle entries.
6. Each entry MUST cover exactly ONE distinct muscle group with EXACTLY ONE muscleId. Never put multiple muscleIds per entry.
7. NEVER use vague terms like 코어, 하체, 상체, 등근육 as muscleIds — use specific IDs from the allowed list only.
8. Each muscleId must appear AT MOST ONCE across all entries. Do not duplicate muscleIds.
9. Identify which exercises in the WOD match our exercise DB and return their IDs in "exerciseIds". Only use IDs from the exercise list below.
10. Abbreviation lookup (always resolve these): BP=bench_press, P-row/P row=pendlay_row, BS=back_squat, FS=front_squat, OHS=overhead_squat, DL=deadlift, PC=power_clean, HPC=hang_power_clean, HC=hang_clean, PS=power_snatch, C&J=clean_and_jerk, PP=push_press, PJ=push_jerk, SJ=split_jerk, SP=strict_press, CTB=ctb_pullup, BMU=bar_muscle_up, RMU=ring_muscle_up, T2B=toes_to_bar, K2E=knees_to_elbow, DU=double_under, TGU=turkish_getup, RDL=romanian_deadlift.

JSON format:
{
  "muscles": [
    { "name": "한국어 근육명", "muscleIds": ["id1"], "intensity": "high" }
  ],
  "exerciseIds": ["thruster", "pullup"],
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
Exercise DB: ${EXERCISE_LIST}

intensity values: "high" (주동근, 고중량 주도근), "medium" (보조근, 협력근), "low" (안정화근, 코어 지지)`;

const INTENSITY_SCORE = { high: 3, medium: 2, low: 1 };

export function aggregate(results) {
  const votes = {};

  results.forEach(result => {
    const seenInRun = new Set();
    (result.muscles || []).forEach(m => {
      const intensity = (m.intensity || '').toLowerCase();
      if (!INTENSITY_SCORE[intensity]) return;
      (m.muscleIds || []).forEach(id => {
        if (!VALID_MUSCLE_IDS.has(id)) return;
        if (seenInRun.has(id)) return;
        seenInRun.add(id);
        if (!votes[id]) votes[id] = { high: 0, medium: 0, low: 0, total: 0 };
        votes[id][intensity]++;
        votes[id].total++;
      });
    });
  });

  const muscles = Object.entries(votes)
    .filter(([, v]) => v.total >= 2)
    .map(([id, v]) => {
      const score = (v.high * 3 + v.medium * 2 + v.low * 1) / v.total;
      let intensity = score >= 2.5 ? 'high' : score >= 1.5 ? 'medium' : 'low';
      if (v.total === 2) intensity = 'low';
      const name = MUSCLE_KO[id] || id;
      return { name, muscleIds: [id], intensity, confidence: v.total };
    })
    .sort((a, b) => INTENSITY_SCORE[b.intensity] - INTENSITY_SCORE[a.intensity]);

  // exerciseIds 집계 — 과반수 이상
  const exVotes = {};
  results.forEach(result => {
    (result.exerciseIds || []).forEach(id => {
      exVotes[id] = (exVotes[id] || 0) + 1;
    });
  });
  const threshold = Math.ceil(results.length / 2);
  const exerciseIds = Object.keys(exVotes).filter(id => exVotes[id] >= threshold);

  const bestSummary = results
    .map(r => r.summary || '')
    .reduce((best, s) => s.length > best.length ? s : best, '');

  return {
    muscles,
    exerciseIds,
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
