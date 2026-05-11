import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const normalizeEnvValue = (value, names = []) => {
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
  };

  const getEnv = (names) => {
    for (const name of names) {
      const value = normalizeEnvValue(env[name], names);
      if (value) {
        return value;
      }
    }

    return undefined;
  };

  const apiKey = getEnv(["GEMINI_API_KEY", "VITE_GEMINI_API_KEY"]);
  const model = getEnv(["GEMINI_MODEL", "VITE_GEMINI_MODEL"]) || "gemini-2.5-flash-lite";
  const attachGeminiProxy = (middlewares) => {
    middlewares.use("/api/gemini", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      if (!apiKey) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Missing GEMINI_API_KEY or VITE_GEMINI_API_KEY in environment." }));
        return;
      }

      let rawBody = "";
      req.on("data", (chunk) => {
        rawBody += chunk;
      });

      req.on("end", async () => {
        try {
          const parsedBody = rawBody ? JSON.parse(rawBody) : {};
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(parsedBody),
            },
          );

          const text = await response.text();
          res.statusCode = response.status;
          res.setHeader("Content-Type", "application/json");
          if (!response.ok) {
            let message = `Gemini API error: ${response.status}`;

            try {
              const parsed = JSON.parse(text);
              message =
                parsed?.error?.message ||
                parsed?.message ||
                message;
            } catch {
              if (text) {
                message = text;
              }
            }

            if (message.includes("API key not valid")) {
              message +=
                " Check the environment variable value and paste only the raw Gemini key, not a full NAME=value line.";
            }

            res.end(JSON.stringify({ error: message, model }));
            return;
          }

          res.end(text);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown proxy error",
              model,
            }),
          );
        }
      });
    });
  };

  return {
    plugins: [
      react(),
      {
        name: "gemini-api-proxy",
        configureServer(server) {
          attachGeminiProxy(server.middlewares);
        },
        configurePreviewServer(server) {
          attachGeminiProxy(server.middlewares);
        },
      },
    ],
  };
});
