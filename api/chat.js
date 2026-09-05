export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY; // or process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on Vercel" });
  }

  try {
    // Transform Gemini format contents into standard message array
    const userPrompt =
      req.body.contents?.[req.body.contents.length - 1]?.parts?.[0]?.text || "";

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: userPrompt }],
        }),
      },
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Return response formatted for your existing script.js handler
    const aiText = data.choices[0].message.content;
    return res.status(200).json({
      candidates: [
        {
          content: {
            parts: [{ text: aiText }],
          },
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to contact Groq API" });
  }
}
