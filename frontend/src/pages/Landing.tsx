import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': any;
    }
  }
}

export default function Landing() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Spline viewer script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.9.79/build/spline-viewer.js';
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-transparent py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">EmpathicCall</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/auth?mode=signin"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                Enhance Your Calls with{' '}
                <span className="text-blue-600">Emotional Intelligence</span>
              </h2>
              <p className="text-xl text-gray-600">
                Transform your communication with real-time emotion detection and intelligent insights. Perfect for customer service, therapy sessions, and team collaboration.
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/auth?mode=signup"
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  Get Started
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-lg"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Column - 3D Animation */}
            <div className="relative h-[600px] w-full">
              {isLoaded && (
                <spline-viewer url="https://prod.spline.design/vxB7WUnHMi0J2wn3/scene.splinecode"></spline-viewer>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose EmpathicCall?
              </h2>
              <p className="text-xl text-gray-600">
                Discover how our features can transform your communication
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Real-time Emotion Detection
                </h3>
                <p className="text-gray-600">
                  Get instant insights into emotional states during calls, helping you respond with empathy.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600">
                  Track emotional patterns and gain valuable insights to improve communication.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Secure & Private
                </h3>
                <p className="text-gray-600">
                  Enterprise-grade security ensures your conversations remain confidential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 