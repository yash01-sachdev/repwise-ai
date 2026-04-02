import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
  const model = env.GEMINI_MODEL || env.VITE_GEMINI_MODEL || "gemini-2.5-flash-lite";
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
