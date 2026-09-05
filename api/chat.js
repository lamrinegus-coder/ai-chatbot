const https = require("https");

module.exports = async (req, res) => {
  // 1. Enable CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Check for API key
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "API Key missing in Vercel settings" });
  }

  // 3. Extract text prompt from frontend request body
  let promptText = "Hello";
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (body?.contents) {
      promptText =
        body.contents[body.contents.length - 1]?.parts?.[0]?.text || promptText;
    } else if (body?.message) {
      promptText = body.message;
    } else if (body?.prompt) {
      promptText = body.prompt;
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  // 4. Prepare payload for Groq
  const payload = JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: promptText }],
  });

  const options = {
    hostname: "api.groq.com",
    path: "/openai/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  // 5. Execute HTTP Request
  const apiReq = https.request(options, (apiRes) => {
    let responseData = "";

    apiRes.on("data", (chunk) => {
      responseData += chunk;
    });

    apiRes.on("end", () => {
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.error) {
          return res.status(500).json({ error: parsed.error.message });
        }

        const aiMessage = parsed.choices?.[0]?.message?.content || "No reply";

        // Return structure matching Gemini's response format for script.js
        return res.status(200).json({
          candidates: [
            {
              content: {
                parts: [{ text: aiMessage }],
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
