import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/tts
 *
 * Generates speech for a dialogue line using Maya1 on RunPod.
 * Takes text + voice description + emotion instruction.
 */

const RUNPOD_ENDPOINT = process.env.RUNPOD_ENDPOINT_URL;
const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;

export async function POST(req: NextRequest) {
  if (!RUNPOD_ENDPOINT || !RUNPOD_API_KEY) {
    return NextResponse.json(
      { error: "RunPod not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { text, description, emotion_instruct } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (!description?.trim()) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  // Build the full description with emotion
  let fullDescription = description;
  if (emotion_instruct?.trim()) {
    fullDescription += `. ${emotion_instruct}`;
  }

  try {
    const runRes = await fetch(`${RUNPOD_ENDPOINT}/runsync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          text,
          description: fullDescription,
          temperature: 0.4,
          top_p: 0.9,
        },
      }),
    });

    if (!runRes.ok) {
      const errText = await runRes.text();
      return NextResponse.json(
        { error: `TTS failed (${runRes.status})` },
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
