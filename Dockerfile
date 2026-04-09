FROM nvidia/cuda:12.1.1-cudnn8-devel-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/cache/huggingface

# Install Python 3.12 (required by qwen-tts)
RUN apt-get update && apt-get install -y \
    software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && apt-get install -y \
    python3.12 python3.12-venv python3.12-dev \
    libsndfile1 ffmpeg git curl && \
    rm -rf /var/lib/apt/lists/*

RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 && \
    ln -sf /usr/bin/python3.12 /usr/bin/python && \
    ln -sf /usr/bin/python3.12 /usr/bin/python3

WORKDIR /app

# Install qwen-tts and dependencies
COPY inference-server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model weights
RUN python -c "from huggingface_hub import snapshot_download; \
    snapshot_download('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', cache_dir='/cache/huggingface'); \
    snapshot_download('Qwen/Qwen3-TTS-Tokenizer-12Hz', cache_dir='/cache/huggingface')"

COPY inference-server/model.py .
COPY inference-server/handler.py .

CMD ["python", "handler.py"]
