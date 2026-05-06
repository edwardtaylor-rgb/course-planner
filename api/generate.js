export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { language, cefr, hours, courseType } = req.body;

  // Input validation
  if (!language || !cefr || !hours || !courseType) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (hours < 5 || hours > 300) {
    return res.status(400).json({ error: 'Hours must be between 5 and 300.' });
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
      "listening": ["Listening activity title 1"
