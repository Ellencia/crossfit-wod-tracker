require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  baseURL: process.env.LM_STUDIO_URL || 'http://localhost:1234/v1',
  apiKey: 'lm-studio', // LM Studio는 아무 값이나 허용
});

const MUSCLE_IDS = [
  'trapezius', 'upper-back', 'lower-back',
  'chest', 'biceps', 'triceps',
  'forearm', 'back-deltoids', 'front-deltoids',
  'abs', 'obliques',
  'adductor', 'hamstring', 'quadriceps',
  'abductors', 'calves', 'gluteal',
  'head', 'tibialis',
];

const SYSTEM_PROMPT = `/no_think
You are a CrossFit coach and sports physiologist. Analyze the given WOD (Workout of the Day) and identify which muscle groups are stimulated.

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

app.post('/api/analyze', async (req, res) => {
  const { wod } = req.body;
  if (!wod) return res.status(400).json({ error: 'WOD is required' });

  try {
    const completion = await client.chat.completions.create({
      model: process.env.LM_MODEL || 'local-model',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `WOD: ${wod}` },
      ],
      temperature: 0.3,
      max_tokens: 8192,
      // @ts-ignore — LM Studio Qwen3 thinking 모드 비활성화
      enable_thinking: false,
    });

    const raw = completion.choices[0].message.content;
    console.log('=== 원문 응답 ===');
    console.log(JSON.stringify(raw));
    console.log('================');
    let text = raw.trim();

    // Qwen3 <think>...</think> 블록 제거
    text = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // ```json ... ``` 블록 처리
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) text = jsonMatch[1].trim();

    // JSON 객체만 추출 (앞뒤 잡문자 제거)
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) text = objMatch[0];

    console.log('파싱 시도:', text.slice(0, 200));
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`LM Studio endpoint: ${process.env.LM_STUDIO_URL || 'http://localhost:1234/v1'}`);
});
