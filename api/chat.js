const https = require("https");

module.exports = async (req, res) => {
  // 1. CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Fetch API Key from Vercel Environment Variables
  const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "API Key is missing in Vercel settings." });
  }

  // 3. Extract the prompt text safely from the client request
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
    console.error("Payload parse error:", err);
  }

  // 4. Build Gemini API Payload
  const payload = JSON.stringify({
    contents: [
      {
        parts: [{ text: userText }],
      },
    ],
  });

  // 5. Google Generative Language v1beta Endpoint Configuration
  const options = {
    hostname: "generativelanguage.googleapis.com",
    path: `/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  // 6. Send HTTPS Request
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
            .json({ error: parsed.error.message || "Gemini API Error" });
        }

        // Return standard response structure back to frontend (script.js)
        return res.status(200).json(parsed);
      } catch (err) {
        return res
          .status(500)
          .json({ error: "Failed to parse Gemini API response." });
      }
    });
  });

  apiReq.on("error", (error) => {
    return res.status(500).json({ error: error.message });
  });

  apiReq.write(payload);
  apiReq.end();
};
