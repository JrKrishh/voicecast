FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/cache/huggingface

RUN apt-get update && apt-get install -y \
    python3.11 python3.11-venv python3-pip git \
    libsndfile1 ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN ln -sf /usr/bin/python3.11 /usr/bin/python && \
    ln -sf /usr/bin/python3.11 /usr/bin/python3

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Qwen3-TTS models during build for faster cold starts
RUN python -c "from huggingface_hub import snapshot_download; \
    snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', cache_dir='/cache/huggingface')"

COPY model.py .
COPY handler.py .

CMD ["python", "handler.py"]
