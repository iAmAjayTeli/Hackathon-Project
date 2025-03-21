FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
COPY pyproject.toml .

# Install dependencies with pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY app app/

# Expose the port
EXPOSE 8000

# Increase the healthcheck timeout
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl --fail http://localhost:8000/health || exit 1

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"] 