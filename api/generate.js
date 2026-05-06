const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { language, cefr, hours, courseType } = req.body;

  if (!language || !cefr || !hours || !courseType) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const numModules = Math.max(3, Math.min(12, Math.round(hours / 8)));
  const hoursPerModule = Math.round(hours / numModules);

  const prompt = `You are an expert language curriculum designer. Create a ${language} language course programme for adult learners at CEFR level ${cefr}. The course is ${hours} hours total, divided into ${numModules} modules of approximately ${hoursPerModule} hours each. Course type: ${courseType}.

Return ONLY valid JSON — no markdown, no explanation, no backticks. Use this exact structure:
{
  "modules": [
    {
      "number": 1,
      "theme": "theme name",
      "title": "Module title",
      "hours": ${hoursPerModule},
      "reading": ["Reading activity title 1", "Reading activity title 2"],
      "listening": ["Listening activity title 1", "Listening activity title 2"],
      "grammar": ["Grammar topic 1", "Grammar topic 2"],
      "vocabulary": ["Vocabulary area 1", "Vocabulary area 2", "Vocabulary area 3"],
      "functional": ["Functional phrase/expression 1", "Functional phrase/expression 2"],
      "pronunciation": ["Pronunciation focus 1"]
    }
  ]
}

Themes should be varied and relevant to adult life: e.g. Health & Wellbeing, Work & Careers, Travel & Transport, Technology & Innovation, Environment & Sustainability, Culture & Society, Food & Lifestyle, Finance & Economics, Media & Communication, Housing & Urban Life. Each module should have 2 reading titles, 2 listening titles, 2-3 grammar points, 3-4 vocabulary areas, 2 functional language items, 1-2 pronunciation focuses. Titles should be specific and engaging for adults at ${cefr} level in ${language}.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic API error ${response.status}`);
    }

    const data = await response.json();
    const raw = data.content.map(i => i.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (e) {
    console.error('Generate error:', e.message);
    return res.status(500).json({ error: e.message || 'Failed to generate programme.' });
  }
};

module.exports = handler;
