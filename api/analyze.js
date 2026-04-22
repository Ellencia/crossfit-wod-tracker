const Groq = require('groq-sdk');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MUSCLE_IDS = [
  'trapezius', 'upper-back', 'lower-back',
  'chest', 'biceps', 'triceps',
  'forearm', 'back-deltoids', 'front-deltoids',
  'abs', 'obliques',
  'adductor', 'hamstring', 'quadriceps',
  'abductors', 'calves', 'gluteal',
  'head', 'tibialis',
];

const SYSTEM_PROMPT = `You are a CrossFit coach and sports physiologist. Analyze the WOD and respond ONLY in JSON format.

CRITICAL RULES:
1. Output raw JSON only — no markdown, no code blocks, no extra text
2. "summary" and "recovery" MUST be written in Korean (한국어)
3. "name" fields MUST be Korean muscle names (e.g. 대퇴사두근, 햄스트링, 삼두근, 복근)
4. muscleIds must ONLY use values from the allowed list
5. Be THOROUGH — list every muscle group involved, including stabilizers. Aim for 6-10 muscle entries.
6. Each entry should cover ONE muscle group only (do not group unrelated muscles together)

JSON format:
{
  "muscles": [
    { "name": "한국어 근육명", "muscleIds": ["id1"], "intensity": "high" }
  ],
  "summary": "이 운동에 대한 한국어 설명 2-3문장",
  "recovery": "한국어 회복 권장사항 1-2문장"
}

Allowed muscleIds: ${MUSCLE_IDS.join(', ')}

intensity values: "high" (주동근, 고중량 주도근), "medium" (보조근, 협력근), "low" (안정화근, 코어 지지)`;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { wod } = req.body;
  if (!wod) return res.status(400).json({ error: 'WOD is required' });

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek-r1-distill-llama-70b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `WOD: ${wod}` },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    let text = completion.choices[0].message.content.trim();
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    console.log('RAW:', text.slice(0, 300));
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) text = objMatch[0];

    const data = JSON.parse(text);
    console.log('summary:', data.summary);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
