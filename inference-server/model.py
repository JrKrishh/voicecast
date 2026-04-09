"""
Qwen3-TTS Voice Engine — Model loader and inference

Two modes:
1. Voice Design: create a new voice from a text description
2. TTS: generate speech using a designed voice + emotion instructions
"""

import io
import base64
import numpy as np
import soundfile as sf

_voice_design_model = None
_tts_model = None


def load_models():
    """Load Qwen3-TTS models. Called once at startup."""
    global _voice_design_model, _tts_model

    if _voice_design_model is not None:
        return

    print("[Qwen3-TTS] Loading VoiceDesign model (1.7B)...")
    from qwen_tts import QwenTTS

    # Voice Design model — creates new voices from descriptions
    _voice_design_model = QwenTTS(
        model="Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign",
        device="cuda",
    )
    print("[Qwen3-TTS] VoiceDesign model loaded.")

    # Base model — for voice cloning (optional, loaded on demand)
    # _tts_model = QwenTTS(model="Qwen/Qwen3-TTS-12Hz-1.7B-Base", device="cuda")

    print("[Qwen3-TTS] All models ready.")


def design_voice(
    text: str,
    voice_description: str,
) -> tuple[np.ndarray, int]:
    """
    Generate speech with a custom voice designed from description.

    The VoiceDesign model takes:
    - text: what to say
    - instruct: voice description + delivery instructions

    Returns (audio_samples, sample_rate)
    """
    if _voice_design_model is None:
        load_models()

    # Qwen3-TTS VoiceDesign uses the instruct field for voice description
    audio = _voice_design_model.synthesize(
        text=text,
        instruct=voice_description,
    )

    return audio["samples"], audio["sample_rate"]


def design_voice_to_base64(
    text: str,
    voice_description: str,
) -> dict:
    """Generate speech and return as base64 WAV."""
    samples, sr = design_voice(text, voice_description)

    buf = io.BytesIO()
    sf.write(buf, samples, sr, format="WAV")
    audio_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    duration = len(samples) / sr

    return {
        "audio_base64": audio_b64,
        "duration_seconds": round(duration, 2),
        "sample_rate": sr,
        "format": "wav",
    }
