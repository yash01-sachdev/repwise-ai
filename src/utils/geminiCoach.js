const GEMINI_PROXY_URL = "/api/gemini";

function getErrorMessage(data, status) {
  const rawError = data?.error;

  if (typeof rawError === "string" && rawError.trim()) {
    return rawError;
  }

  if (rawError && typeof rawError === "object") {
    if (typeof rawError.message === "string" && rawError.message.trim()) {
      return rawError.message;
    }
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  const modelText = typeof data?.model === "string" ? ` (${data.model})` : "";
  return `Gemini API error: ${status}${modelText}`;
}

export async function getCoachingFeedback(workoutLog) {
  const prompt = `You are a sharp, experienced strength coach.

Reply like a real coach texting back after reading a workout update.

Keep it short:
- 3 to 5 sentences total
- under 120 words
- natural language only
- no labels, no bullet points, no headings, no markdown

What to do:
- briefly say how impressive or not impressive the lift/session is
- mention the key number from the log if there is one
- give one clear next-step coaching suggestion
- add a little context on what the result says about current strength or progress

Tone:
- direct
- supportive
- not robotic
- not overly hyped

Workout log: ${workoutLog}`;

  const response = await fetch(GEMINI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.status));
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
