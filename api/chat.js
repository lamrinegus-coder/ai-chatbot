export default async function handler(req, res) {
  // Allow only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Retrieve the API Key from Vercel Environment Variables
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "API key is missing in Vercel settings." });
  }

  try {
    // Safely extract message prompt whether from Gemini format or standard prompt format
    let userPrompt = "Hello";
    if (req.body?.contents) {
      userPrompt =
        req.body.contents[req.body.contents.length - 1]?.parts?.[0]?.text ||
        userPrompt;
    } else if (req.body?.prompt) {
      userPrompt = req.body.prompt;
    } else if (req.body?.message) {
      userPrompt = req.body.message;
    }

    // Call Groq API
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ` Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: userPrompt }],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(500).json({
        error:
          data.error?.message || `Provider returned status ${response.status}`,
      });
    }

    const aiText = data.choices[0]?.message?.content || "No response received.";

    // Return structured format compatible with your frontend
    return res.status(200).json({
      candidates: [
        {
          content: {
            parts: [{ text: aiText }],
          },
        },
      ],
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: err.message || "Server error processing request." });
  }
}
