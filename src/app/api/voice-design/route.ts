import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/voice-design
 *
 * Creates a custom voice preview using Maya1 on RunPod.
 * Takes assembled voice description + preview text, returns audio.
 */

const RUNPOD_ENDPOINT = process.env.RUNPOD_ENDPOINT_URL;
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

export async function POST(req: NextRequest) {
  if (!RUNPOD_ENDPOINT || !RUNPOD_API_KEY) {
    return NextResponse.json(
      { error: "RunPod not configured. Set RUNPOD_ENDPOINT_URL and RUNPOD_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { voice_prompt, preview_text } = body;

  if (!voice_prompt?.trim()) {
    return NextResponse.json({ error: "voice_prompt is required" }, { status: 400 });
  }

  try {
    // Submit job to RunPod
    const runRes = await fetch(`${RUNPOD_ENDPOINT}/runsync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          text: preview_text || "Hello, I am the voice you designed. Listen to how I sound and decide if I match your vision.",
          description: voice_prompt,
          temperature: 0.4,
          top_p: 0.9,
        },
      }),
    });

    if (!runRes.ok) {
      const errText = await runRes.text();
      console.error("RunPod error:", runRes.status, errText);
      return NextResponse.json(
        { error: `Inference failed (${runRes.status})` },
        { status: 502 }
      );
    }

    const result = await runRes.json();

    if (result.status === "FAILED" || result.output?.error) {
      return NextResponse.json(
        { error: result.output?.error || "Generation failed" },
        { status: 500 }
      );
    }

    const output = result.output;
    if (!output?.audio_base64) {
      return NextResponse.json(
        { error: "No audio returned from inference server" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      voice: `maya1_${Date.now()}`,
      preview_audio: output.audio_base64,
      duration_seconds: output.duration_seconds,
      description: voice_prompt,
    });
  } catch (e) {
    console.error("Voice design error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
