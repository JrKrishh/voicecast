"""
RunPod Serverless Handler for Maya1 Voice Engine.

Accepts:
  - text: dialogue text (with optional emotion tags like <laugh>, <angry>)
  - description: voice description ("Female, 30s, British accent, warm tone")
  - temperature: generation temperature (default 0.4)
  - top_p: nucleus sampling (default 0.9)

Returns:
  - audio_base64: base64-encoded WAV audio
  - duration_seconds: audio duration
  - sample_rate: 24000
"""

import runpod
import base64
import io
import numpy as np
import soundfile as sf
from model import load_models, generate_speech


def handler(job):
    """RunPod serverless handler."""
    job_input = job["input"]

    text = job_input.get("text", "").strip()
    description = job_input.get("description", "").strip()

    if not text:
        return {"error": "text is required"}
    if not description:
        return {"error": "description is required"}

    temperature = float(job_input.get("temperature", 0.4))
    top_p = float(job_input.get("top_p", 0.9))
    max_tokens = int(job_input.get("max_new_tokens", 2048))

    try:
        audio, sr = generate_speech(
            text=text,
            description=description,
            temperature=temperature,
            top_p=top_p,
            max_new_tokens=max_tokens,
        )

        # Encode as WAV base64
        buf = io.BytesIO()
        sf.write(buf, audio, sr, format="WAV")
        audio_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        duration = len(audio) / sr

        return {
            "audio_base64": audio_b64,
            "duration_seconds": round(duration, 2),
            "sample_rate": sr,
            "format": "wav",
        }

    except Exception as e:
        return {"error": str(e)}


# Load models at cold start
print("[RunPod] Loading Maya1 models at startup...")
load_models()
print("[RunPod] Models ready. Starting handler.")

runpod.serverless.start({"handler": handler})
