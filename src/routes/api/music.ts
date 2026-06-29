import { createFileRoute } from "@tanstack/react-router";

// In-memory cache so we only call ElevenLabs once per worker instance.
let cached: ArrayBuffer | null = null;
let inflight: Promise<ArrayBuffer> | null = null;

async function generate(): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ElevenLabs is not connected");

  const res = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: "Cozy Japanese café ambience: soft mellow lofi piano loop, gentle ukulele, warm vinyl crackle, light jazz brush drums, dreamy kawaii pastel vibe, slow tempo, seamless looping instrumental background",
      duration_seconds: 22,
      prompt_influence: 0.4,
      loop: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ElevenLabs music failed: ${res.status} ${text}`);
  }
  return res.arrayBuffer();
}

export const Route = createFileRoute("/api/music")({
  server: {
    handlers: {
      GET: async () => {
        try {
          if (!cached) {
            if (!inflight) inflight = generate();
            cached = await inflight;
            inflight = null;
          }
          return new Response(cached, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        } catch (err) {
          inflight = null;
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
