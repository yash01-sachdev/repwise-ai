const DEFAULT_MODEL = "gemini-2.5-flash-lite";

function normalizeEnvValue(value, names = []) {
  if (typeof value !== "string") {
    return undefined;
  }

  let cleaned = value.trim();

  if (!cleaned) {
    return undefined;
  }

  if (
    cleaned.length >= 2 &&
    ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'")))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  for (const name of names) {
    const prefix = `${name}=`;
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length).trim();
      break;
    }
  }

  return cleaned || undefined;
}

function getEnv(names) {
  for (const name of names) {
    const value = normalizeEnvValue(process.env[name], names);
    if (value) {
      return value;
    }
  }

  return undefined;
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

  const apiKey = getEnv(["GEMINI_API_KEY", "VITE_GEMINI_API_KEY"]);
  const model = getEnv(["GEMINI_MODEL", "VITE_GEMINI_MODEL"]) || DEFAULT_MODEL;

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

      if (message.includes("API key not valid")) {
        message +=
          " Check the Netlify environment variable value and paste only the raw Gemini key, not a full NAME=value line.";
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
