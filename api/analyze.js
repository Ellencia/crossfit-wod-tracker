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

const SYSTEM_PROMPT = `You are a CrossFit coach and sports physiologist. Analyze the given WOD (Workout of the Day) and identify which muscle groups are stimulated.

You MUST respond with valid JSON only. No markdown code blocks, no explanation, just raw JSON.

The response format must be exactly:
{
  "muscles": [
    {
      "name": "Korean muscle name",
      "muscleIds": ["muscle_id1", "muscle_id2"],
      "intensity": "high"
    }
  ],
  "summary": "Korean summary of the workout in 2-3 sentences",
  "recovery": "Korean recovery recommendations in 1-2 sentences"
}

Valid muscleIds are ONLY from this list: ${MUSCLE_IDS.join(', ')}

intensity must be one of: "high", "medium", "low"
- high: Primary mover muscles, heavily loaded
- medium: Secondary movers or stabilizers under significant load
- low: Stabilizers or lightly engaged muscles`;

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
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `WOD: ${wod}` },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    let text = completion.choices[0].message.content.trim();
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) text = objMatch[0];

    const data = JSON.parse(text);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
