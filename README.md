# EmpathicCall

Real-time emotion detection for customer service interactions. Enhance customer service quality by providing agents with live emotional feedback and actionable insights.

## Features

- Real-time voice input processing
- Live emotion detection
- Dynamic agent feedback
- Call analytics and summaries
- Interactive emotion timeline
- User authentication and management
- Call recording and playback
- Detailed analytics dashboard
- Multiple audio visualization styles

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS
- Web Audio API
- WebSocket client
- Firebase Authentication
- Firebase Storage
- Firebase Firestore

### Backend
- FastAPI (Python)
- WebSockets
- MongoDB
- Pre-trained emotion detection model integration

## Project Structure

```
empathiccall/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── services/   # Service classes
│   │   ├── hooks/      # Custom React hooks
│   │   └── pages/      # Page components
├── backend/           # FastAPI backend server
├── docker/            # Docker configuration files
└── docs/             # Project documentation
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB
- Poetry (Python dependency management)
- Firebase account

### Firebase Setup
1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication, Storage, and Firestore
3. Create a web app in your Firebase project
4. Copy the Firebase configuration

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd "D:\Hackathon Project\frontend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_WS_URL=ws://localhost:8000/ws
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies using Poetry:
   ```bash
   poetry install
   ```
3. Create a `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/empathiccall
   API_KEY_EMOTION_SERVICE=your_api_key_here
   FIREBASE_ADMIN_SDK_PATH=path/to/firebase-admin-sdk.json
   ```
4. Start the FastAPI server:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

## Development

1. Backend API runs on `http://localhost:8000`
2. Frontend development server runs on `http://localhost:5173`
3. API documentation available at `http://localhost:8000/docs`

## Features

### Authentication
- Email/password authentication
- Protected routes and API endpoints
- User session management

### Call Recording
- Real-time audio capture
- Automatic call recording
- Recording playback
- Recording metadata storage

### Analytics
- Call duration metrics
- Emotion breakdown
- Trend analysis
- Performance insights

### Audio Visualization
- Multiple visualization styles:
  - Frequency bars
  - Waveform
  - Circular visualization
- Real-time volume meter
- Customizable colors

## License

MIT License - See LICENSE file for details 