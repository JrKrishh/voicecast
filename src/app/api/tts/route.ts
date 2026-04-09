import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tts
 *
 * Step 2: Generates a dialogue line using the cloned voice.
 * The voice_id comes from a previous /api/voice-design call.
 * Same voice is used consistently across all lines.
 */

const RUNPOD_ENDPOINT = process.env.RUNPOD_ENDPOINT_URL;
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

export async function POST(req: NextRequest) {
  if (!RUNPOD_ENDPOINT || !RUNPOD_API_KEY) {
    return NextResponse.json({ error: "RunPod not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { text, voice_id } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (!voice_id?.trim()) {
    return NextResponse.json({ error: "voice_id is required" }, { status: 400 });
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
          action: "generate",
          text,
          voice_id,
          language: "English",
        },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `RunPod error (${res.status})` }, { status: 502 });
    }

    const result = await res.json();

    if (result.status === "FAILED" || result.output?.error) {
      return NextResponse.json(
        { error: result.output?.error || "Generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audio_base64: result.output.audio_base64,
      duration_seconds: result.output.duration_seconds,
      format: "wav",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
