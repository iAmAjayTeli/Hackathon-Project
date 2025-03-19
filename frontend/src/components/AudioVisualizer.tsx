import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  mediaStream: MediaStream | null;
  visualizationType?: 'bars' | 'wave' | 'circle' | 'spectrum' | 'particles' | '3d';
  colors?: {
    primary: string;
    secondary: string;
    tertiary?: string;
  };
  options?: {
    sensitivity: number;
    smoothing: number;
    particleCount: number;
    rotationSpeed: number;
  };
}

export default function AudioVisualizer({ 
  mediaStream, 
  visualizationType = 'bars',
  colors = {
    primary: 'rgb(59, 130, 246)',    // Blue
    secondary: 'rgb(147, 197, 253)',  // Light blue
    tertiary: 'rgb(37, 99, 235)',    // Dark blue
  },
  options = {
    sensitivity: 1.5,
    smoothing: 0.8,
    particleCount: 100,
    rotationSpeed: 0.001
  }
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | undefined>(undefined);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    speed: number;
    amplitude: number;
  }>>([]);

  useEffect(() => {
    if (!mediaStream || !canvasRef.current) return;

    // Initialize audio context and analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = options.smoothing;
    
    const bufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    // Connect media stream to analyser
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);

    // Store refs for cleanup
    analyserRef.current = analyser;
    audioContextRef.current = audioContext;

    // Initialize particles for particle visualization
    if (visualizationType === 'particles') {
      particlesRef.current = Array.from({ length: options.particleCount }, () => ({
        x: Math.random() * canvasRef.current!.width,
        y: Math.random() * canvasRef.current!.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 0.5,
        amplitude: Math.random() * 20 + 10
      }));
    }

    // Get canvas context
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    // Draw methods for different visualization types
    const drawMethods = {
      bars: () => {
        analyser.getByteFrequencyData(frequencyData);
        
        canvasCtx.fillStyle = 'rgb(249, 250, 251)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / (bufferLength / 4)) * 2.5;
        let x = 0;

        // Draw volume meter
        const averageVolume = frequencyData.reduce((acc, val) => acc + val, 0) / bufferLength;
        
        canvasCtx.fillStyle = colors.primary;
        canvasCtx.fillRect(0, canvas.height - 4, (averageVolume / 255) * canvas.width, 4);

        // Draw frequency bars
        for (let i = 0; i < bufferLength / 4; i++) {
          const barHeight = frequencyData[i] * options.sensitivity / 2;

          const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
          gradient.addColorStop(0, colors.primary);
          gradient.addColorStop(1, colors.secondary);

          canvasCtx.fillStyle = gradient;
          canvasCtx.fillRect(x, canvas.height - barHeight - 5, barWidth, barHeight);

          x += barWidth + 1;
        }
      },

      spectrum: () => {
        analyser.getByteFrequencyData(frequencyData);
        
        canvasCtx.fillStyle = 'rgb(249, 250, 251)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        canvasCtx.beginPath();
        canvasCtx.moveTo(0, canvas.height);

        for (let i = 0; i < bufferLength; i++) {
          const v = frequencyData[i] * options.sensitivity / 255.0;
          const y = canvas.height - (v * canvas.height);

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height);
        canvasCtx.closePath();

        const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(0.5, colors.secondary);
        gradient.addColorStop(1, colors.tertiary || colors.secondary);

        canvasCtx.fillStyle = gradient;
        canvasCtx.fill();
      },

      particles: () => {
        analyser.getByteFrequencyData(frequencyData);
        
        canvasCtx.fillStyle = 'rgba(249, 250, 251, 0.1)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const averageVolume = frequencyData.reduce((acc, val) => acc + val, 0) / bufferLength;
        const normalizedVolume = averageVolume / 255;

        particlesRef.current.forEach((particle, index) => {
          const frequencyValue = frequencyData[index % bufferLength];
          
          particle.y += particle.speed * normalizedVolume * 5;
          if (particle.y > canvas.height) {
            particle.y = 0;
            particle.x = Math.random() * canvas.width;
          }

          const size = particle.size * (1 + normalizedVolume);
          const hue = (frequencyValue / 255) * 60 + 200; // Blue to purple range

          canvasCtx.beginPath();
          canvasCtx.arc(
            particle.x + Math.sin(particle.y / particle.amplitude) * 20 * normalizedVolume,
            particle.y,
            size,
            0,
            Math.PI * 2
          );
          canvasCtx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
          canvasCtx.fill();
        });
      },

      '3d': () => {
        analyser.getByteFrequencyData(frequencyData);
        
        canvasCtx.fillStyle = 'rgb(249, 250, 251)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.7;
        const bars = 180;
        const rotation = Date.now() * options.rotationSpeed;

        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2 + rotation;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          const frequencyIndex = Math.floor((i / bars) * (bufferLength / 2));
          const value = frequencyData[frequencyIndex] * options.sensitivity;
          const height = (value / 255) * radius * 0.5;

          const gradient = canvasCtx.createLinearGradient(
            centerX, centerY,
            x + Math.cos(angle) * height,
            y + Math.sin(angle) * height
          );
          gradient.addColorStop(0, colors.primary);
          gradient.addColorStop(1, colors.secondary);

          canvasCtx.beginPath();
          canvasCtx.moveTo(x, y);
          canvasCtx.lineTo(
            x + Math.cos(angle) * height,
            y + Math.sin(angle) * height
          );
          canvasCtx.strokeStyle = gradient;
          canvasCtx.lineWidth = 2;
          canvasCtx.stroke();
        }
      },

      wave: () => {
        analyser.getByteTimeDomainData(timeData);
        
        canvasCtx.fillStyle = 'rgb(249, 250, 251)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = colors.primary;
        canvasCtx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = v * (canvas.height / 2);

          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
      },

      circle: () => {
        analyser.getByteFrequencyData(frequencyData);
        
        canvasCtx.fillStyle = 'rgb(249, 250, 251)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        canvasCtx.beginPath();
        canvasCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        canvasCtx.strokeStyle = colors.secondary;
        canvasCtx.stroke();

        const bars = 180;
        const step = Math.PI * 2 / bars;

        for (let i = 0; i < bars; i++) {
          const value = frequencyData[i * 2];
          const barHeight = (value / 255) * radius * 0.5;
          
          const angle = step * i;
          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barHeight);
          const y2 = centerY + Math.sin(angle) * (radius + barHeight);

          canvasCtx.beginPath();
          canvasCtx.moveTo(x1, y1);
          canvasCtx.lineTo(x2, y2);
          canvasCtx.strokeStyle = colors.primary;
          canvasCtx.stroke();
        }
      }
    };

    // Animation function
    function draw() {
      if (!analyserRef.current || !canvas || !canvasCtx) return;

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(draw);

      // Draw the selected visualization
      drawMethods[visualizationType]();
    }

    // Start animation
    draw();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [mediaStream, visualizationType, colors, options]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 bg-gray-50 rounded-lg"
      width={500}
      height={128}
    />
  );
}