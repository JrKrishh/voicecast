import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/voice-design
 *
 * Step 1: Creates a custom voice via Qwen3-TTS VoiceDesign,
 * then clones it into the Base model for consistent reuse.
 * Returns preview audio + voice_id.
 */

const RUNPOD_ENDPOINT = process.env.RUNPOD_ENDPOINT_URL;
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

export async function POST(req: NextRequest) {
  if (!RUNPOD_ENDPOINT || !RUNPOD_API_KEY) {
    return NextResponse.json(
      { error: "RunPod not configured. Set RUNPOD_ENDPOINT_URL and RUNPOD_API_KEY." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { voice_prompt, preview_text } = body;

  if (!voice_prompt?.trim()) {
    return NextResponse.json({ error: "voice_prompt is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${RUNPOD_ENDPOINT}/runsync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          action: "design",
          description: voice_prompt,
          text: preview_text || "Hello, I am the voice you designed. Listen to how I sound and decide if I match your vision.",
          language: "English",
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `RunPod error (${res.status})` }, { status: 502 });
    }

    const result = await res.json();

    if (result.status === "FAILED" || result.output?.error) {
      return NextResponse.json(
        { error: result.output?.error || "Voice design failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      voice_id: result.output.voice_id,
      preview_audio: result.output.audio_base64,
      duration_seconds: result.output.duration_seconds,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
