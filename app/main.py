from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import json
import logging
from app.services.emotion_detection import EmotionDetectionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="EmpathicCall API")

# Enable CORS with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://empathic-call.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
logger.info("Initializing EmotionDetectionService...")
emotion_service = EmotionDetectionService()
logger.info("EmotionDetectionService initialized successfully")

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"New WebSocket connection established for client {client_id}")

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)
        logger.info(f"WebSocket connection closed for client {client_id}")

    async def send_emotion(self, client_id: str, data: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(data)
            logger.debug(f"Sent emotion data to client {client_id}")

manager = ConnectionManager()

@app.get("/api/health")
def health_check():
    """Simple health check endpoint"""
    logger.info("Health check request received")
    return {"status": "ok"}

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    logger.info(f"WebSocket connection request from client {client_id}")
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Receive audio data
            audio_data = await websocket.receive_bytes()
            logger.debug(f"Received audio data from client {client_id}")
            
            # Process audio and detect emotion
            emotion_result = await emotion_service.process_audio(audio_data)
            logger.debug(f"Processed emotion for client {client_id}: {emotion_result['emotion']}")
            
            # Get suggestions based on detected emotion
            suggestions = emotion_service.get_emotion_suggestions(emotion_result["emotion"])
            
            # Combine results
            response = {
                **emotion_result,
                "suggestions": suggestions
            }
            
            # Send results back to client
            await manager.send_emotion(client_id, response)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)

@app.get("/api")
async def root():
    logger.info("Root endpoint request received")
    return {
        "message": "Welcome to EmpathicCall API",
        "version": "0.1.0",
        "status": "running"
    } 