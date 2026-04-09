FROM runpod/pytorch:1.0.3-cu1290-torch290-ubuntu2204

ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/cache/huggingface

RUN apt-get update && apt-get install -y \
    libsndfile1 ffmpeg sox && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY inference-server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model weights
RUN python -c "from huggingface_hub import snapshot_download; \
    snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', cache_dir='/cache/huggingface'); \
    snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-Base', cache_dir='/cache/huggingface'); \
    snapshot_download('Qwen/Qwen3-TTS-Tokenizer-12Hz', cache_dir='/cache/huggingface')"

COPY inference-server/model.py .
COPY inference-server/handler.py .

CMD ["python", "handler.py"]
