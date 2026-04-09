"""
RunPod Serverless Handler for Qwen3-TTS Voice Engine.

Accepts:
  - text: dialogue text to synthesize
  - description: voice description + delivery instructions
    Example: "Elderly female voice, aged 68, gravelly and weathered.
             Dark wizard archetype: cold authority, ancient resonance.
             Deliver with sharp tense intensity, biting tone."

Returns:
  - audio_base64: base64-encoded WAV audio
  - duration_seconds: audio duration
  - sample_rate: sample rate (typically 24000)
"""

import runpod
from model import load_models, design_voice_to_base64


def handler(job):
    """RunPod serverless handler."""
    job_input = job["input"]

    text = job_input.get("text", "").strip()
    description = job_input.get("description", "").strip()

    if not text:
        return {"error": "text is required"}
    if not description:
        return {"error": "description is required — provide a voice description"}

    try:
        result = design_voice_to_base64(
            text=text,
            voice_description=description,
        )
        return result

    except Exception as e:
        return {"error": str(e)}


# Load models at cold start
print("[RunPod] Loading Qwen3-TTS models at startup...")
load_models()
print("[RunPod] Models ready. Starting handler.")

runpod.serverless.start({"handler": handler})
