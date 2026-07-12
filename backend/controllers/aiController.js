const OpenAI = require('openai');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// @desc    AI Issue Triage — converts a natural language complaint into structured data
// @route   POST /api/ai/triage
// @access  Private (any authenticated role) or used from the public reporting flow via a
//          protected server-side call — the API key never touches the frontend.
const triageIssue = async (req, res) => {
  const { complaint, assetName, assetCategory, assetCondition, assetLocation } = req.body;

  if (!complaint || complaint.trim().length < 5) {
    return res.status(400).json({ message: 'Please provide a more detailed complaint description' });
  }

  // Graceful fallback if no AI key is configured — keeps the demo alive without crashing
  if (!openai) {
    return res.status(200).json({
      suggestedTitle: complaint.slice(0, 60),
      suggestedCategory: assetCategory || 'General',
      suggestedPriority: 'Medium',
      possibleCauses: ['AI service is not configured — please fill this in manually'],
      initialChecks: ['Have a qualified technician inspect the asset before use'],
      recurringWarning: null,
      aiAvailable: false,
    });
  }

  try {
    const systemPrompt = `You are an assistant that triages maintenance complaints for physical assets (schools, hospitals, offices, factories).
Given a complaint, respond ONLY with a valid JSON object (no markdown, no prose) in this exact shape:
{
  "suggestedTitle": "string, a short professional issue title",
  "suggestedCategory": "string, e.g. Electrical, Leakage, Performance, Mechanical, Safety",
  "suggestedPriority": "Low" | "Medium" | "High" | "Critical",
  "possibleCauses": ["array", "of", "short strings"],
  "initialChecks": ["array of safe, non-technical initial checks a non-expert can safely perform"],
  "recurringWarning": "string or null, only if the complaint suggests a recurring/systemic issue"
}
Safety rules:
- Never give instructions that require opening electrical panels, handling gas lines, or working at height.
- If the complaint mentions fire, sparks, gas smell, exposed wiring, or water near electricity, set suggestedPriority to "Critical" and make the first initialCheck a safety warning to evacuate/power off and call a qualified technician immediately.
- initialChecks must be safe for a non-technical reporter — never deep diagnostic or repair steps.`;

    const userPrompt = `Asset: ${assetName || 'Unknown'} (${assetCategory || 'Unknown category'})
Current condition: ${assetCondition || 'Unknown'}
Location: ${assetLocation || 'Unknown'}
Complaint: "${complaint}"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      return res.status(200).json({
        suggestedTitle: complaint.slice(0, 60),
        suggestedCategory: assetCategory || 'General',
        suggestedPriority: 'Medium',
        possibleCauses: ['AI returned an unexpected format — please review manually'],
        initialChecks: ['Have a qualified technician inspect the asset before use'],
        recurringWarning: null,
        aiAvailable: true,
        parseError: true,
      });
    }

    res.status(200).json({ ...parsed, aiAvailable: true });
  } catch (error) {
    // Graceful degradation on timeout / API failure — never block the workflow
    console.error('AI Triage error:', error.message);
    res.status(200).json({
      suggestedTitle: complaint.slice(0, 60),
      suggestedCategory: assetCategory || 'General',
      suggestedPriority: 'Medium',
      possibleCauses: ['AI service temporarily unavailable — please fill this in manually'],
      initialChecks: ['Have a qualified technician inspect the asset before use'],
      recurringWarning: null,
      aiAvailable: false,
      error: true,
    });
  }
};

module.exports = { triageIssue };
