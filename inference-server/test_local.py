"""
Local test script — run this on a machine with GPU to verify the model works.
Not needed for RunPod deployment (RunPod runs handler.py directly).

Usage:
  python test_local.py
"""

from model import load_models, design_voice_to_base64
import base64

print("Loading models...")
load_models()

# Test 1: Young female voice
print("\n--- Test 1: Young female ---")
result = design_voice_to_base64(
    text="Hello! I'm so excited to meet you. This is going to be an amazing adventure!",
    voice_description="Young adult female voice, aged 22, clear and energetic, bright tone with natural warmth. Speaks with enthusiasm and a slight smile in the voice.",
)
print(f"Duration: {result['duration_seconds']}s, Sample rate: {result['sample_rate']}")
with open("test_young_female.wav", "wb") as f:
    f.write(base64.b64decode(result["audio_base64"]))
print("Saved: test_young_female.wav")

# Test 2: Old male villain
print("\n--- Test 2: Old male villain ---")
result = design_voice_to_base64(
    text="You dare challenge me after all these centuries? How amusing.",
    voice_description="Elderly male voice, aged 75, deep gravelly baritone, slow and deliberate. Dark wizard archetype: cold authority, ancient resonance, power beneath restraint. Deliver with sharp contemptuous intensity.",
)
print(f"Duration: {result['duration_seconds']}s, Sample rate: {result['sample_rate']}")
with open("test_old_villain.wav", "wb") as f:
    f.write(base64.b64decode(result["audio_base64"]))
print("Saved: test_old_villain.wav")

# Test 3: Child voice
print("\n--- Test 3: Child ---")
result = design_voice_to_base64(
    text="Mommy, look what I found! Can I keep it? Please please please!",
    voice_description="Young child female voice, aged 7, high-pitched, light, playful, slightly breathless with wide-eyed energy. Speaks with innocent excitement.",
)
print(f"Duration: {result['duration_seconds']}s, Sample rate: {result['sample_rate']}")
with open("test_child.wav", "wb") as f:
    f.write(base64.b64decode(result["audio_base64"]))
print("Saved: test_child.wav")

print("\nAll tests passed!")
