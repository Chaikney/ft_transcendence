# Use a lightweight Python base image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install only serving dependencies (excluding heavy PyTorch)
RUN pip install --no-cache-dir \
    "chess>=1.11.2" \
    "fastapi>=0.136.3" \
    "numpy>=2.4.6" \
    "torch>=2.12.0" \
    "uvicorn>=0.49.0"

# Copy source code and pre-trained model weights (.npz format)
COPY src/ /app/src/
COPY main.py /app/main.py

# Expose port 8000 for FastAPI
EXPOSE 8000

# Start the uvicorn API server
CMD ["python", "main.py"]
