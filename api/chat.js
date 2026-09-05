const https = require("https");

module.exports = async (req, res) => {
  // CORS setup
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Use GROQ API key if available, otherwise fall back to GEMINI
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "API key missing in Vercel Environment Variables." });
  }

  // Extract prompt safely from request body
  let userText = "Hello";
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (body?.contents) {
      userText =
        body.contents[body.contents.length - 1]?.parts?.[0]?.text || userText;
    } else if (body?.message) {
      userText = body.message;
    } else if (body?.prompt) {
      userText = body.prompt;
    }
  } catch (err) {
    console.error("Payload error:", err);
  }

  // Determine standard model provider based on key prefix
  const isGemini = apiKey.startsWith("AIza");

  const payload = isGemini
    ? JSON.stringify({ contents: [{ parts: [{ text: userText }] }] })
    : JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: userText }],
      });

  const options = isGemini
    ? {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      }
    : {
        hostname: "api.groq.com",
        path: "/openai/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Length": Buffer.byteLength(payload),
        },
      };

  const apiReq = https.request(options, (apiRes) => {
    let responseData = "";

    apiRes.on("data", (chunk) => {
      responseData += chunk;
    });

    apiRes.on("end", () => {
      try {
        const parsed = JSON.parse(responseData);

        if (parsed.error) {
          return res
            .status(500)
            .json({ error: parsed.error.message || "API call failed" });
        }

        // Return standardized payload format expected by script.js UI
        const aiMessage = isGemini
          ? parsed.candidates?.[0]?.content?.parts?.[0]?.text
          : parsed.choices?.[0]?.message?.content;

        return res.status(200).json({
          candidates: [
            {
              content: {
                parts: [{ text: aiMessage || "No text received" }],
              },
            },
          ],
        });
      } catch (err) {
        return res.status(500).json({ error: "Failed to parse AI response" });
      }
    });
  });

  apiReq.on("error", (error) => {
    return res.status(500).json({ error: error.message });
  });

  apiReq.write(payload);
  apiReq.end();
};
