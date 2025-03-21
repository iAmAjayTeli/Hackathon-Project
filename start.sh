#!/bin/bash

# Start the application in the background
uvicorn app.main:app --host 0.0.0.0 --port $PORT &

# Store the PID of the uvicorn process
PID=$!

# Wait for the application to be ready
echo "Waiting for application to start..."
for i in {1..30}; do
    if curl -s http://localhost:$PORT/api/health > /dev/null; then
        echo "Application is ready!"
        # Keep the script running with the main process
        wait $PID
        exit 0
    fi
    echo "Attempt $i: Application not ready yet, waiting..."
    sleep 2
done

echo "Application failed to start within 60 seconds"
exit 1 