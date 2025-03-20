# EmpathicCall - AI-Powered Call Center Analytics

EmpathicCall is an innovative call center analytics platform that combines real-time emotion detection with AI-powered insights to enhance customer service interactions.

## 🌟 Key Features

### Real-Time Analytics Dashboard
- **Stats Grid**: View key metrics at a glance
- **Emotion Distribution**: Interactive doughnut chart showing emotion patterns
- **Weekly Trends**: Bar chart displaying performance trends
- **AI-Powered Insights**: Real-time analysis using Gemini AI

### Emotion Detection
- Real-time emotion analysis during calls
- Support for multiple data sources:
  - Voice analysis
  - Text sentiment
  - Facial expressions (optional)
- Instant feedback for call center agents

### AI Integration
- **Gemini AI Integration**: Leveraging the Gemini 2.0 Flash model
- **Smart Insights Generation**: 
  - Trend analysis
  - Pattern recognition
  - Actionable recommendations
- **Confidence Scoring**: AI-generated insights with confidence metrics

### User Interface
- Modern, responsive design
- Intuitive navigation
- Real-time data updates
- Interactive charts and visualizations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Poetry (Python package manager)
- Firebase account
- Google Cloud account with Gemini API access

### Environment Setup

1. Frontend Setup (.env file in frontend directory):
```env
# WebSocket and API Configuration
VITE_WS_URL=ws://localhost:8000/ws

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key
```

2. Backend Setup:
```bash
cd backend
poetry install
python -m uvicorn app.main:app --reload
```

3. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Technical Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Chart.js for data visualization
- Firebase Authentication
- Gemini AI integration

### Backend
- FastAPI
- WebSocket support
- Emotion detection service
- Real-time data processing

## 🔐 Security Features
- Secure authentication with Firebase
- Protected API endpoints
- Environment variable management
- Secure WebSocket connections

## 📊 Analytics Features
- Real-time data processing
- Historical data analysis
- Custom insight generation
- Trend visualization
- Emotion pattern recognition

## 🤝 Contributing
We welcome contributions! Please see our contributing guidelines for more details.

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- Google Cloud Platform for Gemini AI
- Firebase for authentication
- All contributors and supporters

## 📞 Support
For support, please open an issue in the repository or contact our support team.

---
Built with ❤️ for better customer service 