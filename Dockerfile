FROM python:3.9-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
COPY pyproject.toml .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY app app/
COPY start.sh .

# Make the start script executable
RUN chmod +x start.sh

# Expose the port
EXPOSE 8000

# Add health check
HEALTHCHECK --interval=5s --timeout=10s --start-period=10s --retries=3 \
    CMD curl --fail http://localhost:8000/api/health || exit 1

# Command to run the application
CMD ["./start.sh"] 