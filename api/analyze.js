const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const VALID_MUSCLE_IDS = new Set([
  'trapezius', 'upper-back', 'lower-back',
  'chest', 'biceps', 'triceps',
  'forearm', 'deltoids',
  'abs', 'obliques',
  'adductors', 'hamstring', 'quadriceps',
  'abductors', 'calves', 'gluteal',
  'head', 'tibialis', 'neck',
]);

// muscleId → 정규 한국어명 (AI 이름 대신 이걸 사용해서 중복 방지)
const MUSCLE_KO = {
  trapezius: '승모근', 'upper-back': '광배근', 'lower-back': '척추기립근',
  chest: '대흉근', biceps: '이두근', triceps: '삼두근', forearm: '전완근',
  deltoids: '삼각근', abs: '복근', obliques: '복사근',
  adductors: '내전근', hamstring: '햄스트링', quadriceps: '대퇴사두근',
  abductors: '외전근', calves: '종아리', gluteal: '둔근',
  head: '머리', tibialis: '전경골근', neck: '목',
};

// 한글/영문/공백/기본 특수문자 외 이상한 유니코드 제거
const sanitizeName = s => (s || '').replace(/\*\*/g, '').replace(/[^가-힣\w\s\-()·]/g, '').trim();

const EXERCISE_LIST = [
  'clean:Clean', 'power_clean:Power Clean', 'hang_clean:Hang Clean',
  'hang_power_clean:Hang Power Clean/HPC', 'clean_pull:Clean Pull',
  'snatch:Snatch', 'power_snatch:Power Snatch/PS', 'hang_snatch:Hang Snatch/HS',
  'snatch_pull:Snatch Pull', 'clean_and_jerk:Clean & Jerk/C&J',
  'push_jerk:Push Jerk/PJ', 'split_jerk:Split Jerk/SJ',
  'overhead_squat:Overhead Squat/OHS', 'push_press:Push Press/PP',
  'back_squat:Back Squat/BS', 'front_squat:Front Squat/FS',
  'thruster:Thruster', 'deadlift:Deadlift/DL',
  'romanian_deadlift:Romanian Deadlift/RDL', 'sumo_deadlift:Sumo Deadlift/SDL',
  'strict_press:Strict Press/Shoulder Press/SP', 'bench_press:Bench Press/BP',
  'barbell_row:Barbell Row/BB Row', 'pendlay_row:Pendlay Row/P-row/P row', 'good_morning:Good Morning',
  'pullup:Pull-up', 'ctb_pullup:Chest-to-Bar Pull-up/CTB',
  'bar_muscle_up:Bar Muscle-up/BMU', 'ring_muscle_up:Ring Muscle-up/RMU',
  'ring_dip:Ring Dip', 'dip:Dip',
  'hspu:Handstand Push-up/HSPU', 'handstand_walk:Handstand Walk',
  'toes_to_bar:Toes-to-Bar/T2B', 'knees_to_elbow:Knees-to-Elbow/K2E',
  'ring_row:Ring Row', 'rope_climb:Rope Climb',
  'ghd_situp:GHD Sit-up', 'back_extension:Back Extension', 'lsit:L-sit',
  'pushup:Push-up', 'air_squat:Air Squat', 'pistol_squat:Pistol Squat',
  'box_jump:Box Jump', 'box_jump_over:Box Jump Over', 'box_step_up:Box Step-up',
  'burpee:Burpee', 'situp:Sit-up', 'lunge:Lunge',
  'wall_ball:Wall Ball', 'wall_walk:Wall Walk',
  'double_under:Double Under/DU', 'jump_rope:Jump Rope',
  'farmers_carry:Farmer\'s Carry',
  'running:Running/Run', 'rowing:Rowing/Row/Erg',
  'assault_bike:Assault Bike/Echo Bike', 'ski_erg:Ski Erg',
  'kb_swing:Kettlebell Swing/KB Swing', 'kb_clean:Kettlebell Clean',
  'kb_snatch:Kettlebell Snatch', 'turkish_getup:Turkish Get-up/TGU',
  'kb_press:Kettlebell Press', 'db_snatch:Dumbbell Snatch/DB Snatch',
  'db_thruster:Dumbbell Thruster', 'db_clean_jerk:Dumbbell Clean & Jerk',
  'devils_press:Devil\'s Press',
].join(', ');

const SYSTEM_PROMPT = `You are an elite CrossFit coach and sports physiologist. Analyze the WOD and respond ONLY in JSON format.

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
  const votes = {};

  results.forEach(result => {
    const seenInRun = new Set(); // 한 번의 AI 응답 내 중복 muscleId 방지
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
      // AI 이름 대신 정규 한국어명 사용 — 다른 근육이 같은 이름을 갖는 문제 방지
      const name = MUSCLE_KO[id] || id;
      return { name, muscleIds: [id], intensity, confidence: v.total };
    })
    .sort((a, b) => INTENSITY_SCORE[b.intensity] - INTENSITY_SCORE[a.intensity]);

  // exerciseIds 집계 — 과반수 이상 동의한 것만
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
  const first = results[0];
  return {
    muscles,
    exerciseIds,
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
    if (!results.length) {
      const reasons = settled.map((r, i) =>
        r.status === 'rejected' ? `[${i}] ${r.reason?.message || r.reason}` : null
      ).filter(Boolean);
      console.error('Groq 실패 원인:', reasons.join(' | '));
      throw new Error(`모든 요청 실패: ${reasons[0] || 'unknown'}`);
    }

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
