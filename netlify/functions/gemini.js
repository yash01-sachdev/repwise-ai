const DEFAULT_MODEL = "gemini-2.5-flash-lite";

function getEnv(name, fallbackName) {
  return process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = getEnv("GEMINI_API_KEY", "VITE_GEMINI_API_KEY");
  const model = getEnv("GEMINI_MODEL", "VITE_GEMINI_MODEL") || DEFAULT_MODEL;

  if (!apiKey) {
    return jsonResponse(
      { error: "Missing GEMINI_API_KEY (or VITE_GEMINI_API_KEY) in Netlify environment variables." },
      500,
    );
  }

  try {
    const body = await request.json();
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const text = await response.text();

    if (!response.ok) {
      let message = `Gemini API error: ${response.status}`;

      try {
        const parsed = JSON.parse(text);
        message = parsed?.error?.message || parsed?.message || message;
      } catch {
        if (text) {
          message = text;
        }
      }

      return jsonResponse({ error: message, model }, response.status);
    }

    return new Response(text, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown Netlify function error",
        model,
      },
      500,
    );
  }
}
