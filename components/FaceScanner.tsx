
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface FaceScannerProps {
  mode: 'capture' | 'verify';
  onCapture?: (dataUrl: string) => void;
  onRecognized?: () => void;
  storedFace?: string;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ mode, onCapture, onRecognized, storedFace }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'permission-denied' | 'captured' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    stopCamera();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true);
        };
        setStatus('idle');
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setStatus('permission-denied');
      setIsCameraActive(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage("Camera permission was denied. Please check your browser settings and refresh.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage("No camera found on this device.");
      } else {
        setErrorMessage("Could not access camera. Ensure it's not being used by another application.");
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const verifyIdentity = async (liveDataUrl: string) => {
    if (!storedFace) {
      setStatus('failed');
      setErrorMessage("No reference face data found.");
      return;
    }
    
    setStatus('scanning');
    setErrorMessage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const liveBase64 = liveDataUrl.split(',')[1];
      const storedBase64 = storedFace.split(',')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: "STRICT BIOMETRIC AUDIT 2026: Compare Image 1 (Reference) with Image 2 (Current). Determine if they are the SAME PERSON. Be strict. Output JSON." },
              { inlineData: { mimeType: 'image/jpeg', data: storedBase64 } },
              { inlineData: { mimeType: 'image/jpeg', data: liveBase64 } }
            ]
          }
        ],
        config: {
          temperature: 0,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              match: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["match", "confidence"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');

      if (result.match === true && result.confidence > 0.8) {
        setStatus('success');
        stopCamera();
        setTimeout(() => {
          onRecognized?.();
        }, 800);
      } else {
        setStatus('failed');
        setErrorMessage(result.reason || "Identity verification failed.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus('failed');
      setErrorMessage("AI system error during scan.");
    }
  };

  const handleAction = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !isCameraActive) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    if (mode === 'capture') {
      setCapturedImage(dataUrl);
      onCapture?.(dataUrl);
      setStatus('captured');
      stopCamera();
    } else {
      verifyIdentity(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStatus('idle');
    setErrorMessage(null);
    onCapture?.('');
    startCamera();
  };

  const handleRetryPermission = () => {
    setStatus('idle');
    startCamera();
  };

  return (
    <div className="w-full text-center">
      <div className={`relative aspect-square w-full max-w-[280px] mx-auto overflow-hidden rounded-[3rem] border-4 transition-all duration-500 ${
        status === 'failed' || status === 'permission-denied' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 
        status === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 
        'border-slate-200'
      } bg-slate-900 shadow-inner`}>
        
        {status === 'captured' && capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        ) : status === 'permission-denied' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
            <i className="fas fa-video-slash text-3xl mb-4 text-red-400"></i>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Camera Blocked</p>
            <p className="text-[10px] text-slate-400 leading-tight mb-4 text-center">{errorMessage}</p>
            <button 
              onClick={handleRetryPermission} 
              className="px-6 py-2 bg-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/40"
            >
              Request Access
            </button>
          </div>
        ) : (
          <>
            {!isCameraActive && status === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <i className="fas fa-spinner animate-spin text-2xl mb-3"></i>
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Initializing 2026 Camera</p>
              </div>
            )}
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`w-full h-full object-cover transition-all duration-700 ${
                status === 'scanning' ? 'blur-[4px] opacity-60 scale-105' : 
                isCameraActive ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {(status === 'idle' || status === 'scanning' || status === 'failed') && isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className={`w-[70%] h-[80%] border-2 rounded-[4rem] border-dashed transition-colors duration-300 ${
              status === 'failed' ? 'border-red-500' : 'border-white/30'
            }`}></div>
            
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-orange-500/50"></div>
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-orange-500/50"></div>
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-orange-500/50"></div>
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-orange-500/50"></div>
          </div>
        )}
        
        {status === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-full h-2 bg-orange-500/50 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(249,115,22,0.8)]"></div>
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white font-black text-[10px] tracking-[0.3em] uppercase">Securing ID...</p>
                </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center animate-in zoom-in duration-300">
             <div className="bg-white p-6 rounded-full text-green-600 shadow-2xl scale-110">
               <i className="fas fa-user-check text-4xl"></i>
             </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="absolute inset-0 bg-red-600/30 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in shake duration-300">
             <div className="bg-white p-5 rounded-full text-red-600 shadow-2xl mb-4">
               <i className="fas fa-shield-alt text-3xl"></i>
             </div>
             <p className="text-white font-black text-xs px-6 uppercase tracking-widest text-center leading-tight">Mismatch Detected</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {status === 'captured' || status === 'failed' ? (
          <button
            onClick={handleRetake}
            className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <i className="fas fa-sync-alt text-sm"></i>
            {status === 'failed' ? 'Retry Security Scan' : 'Retake Enrollment Photo'}
          </button>
        ) : status === 'permission-denied' ? (
           <button
            onClick={handleRetryPermission}
            className="w-full py-5 rounded-2xl font-black text-xs tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl"
          >
            REFRESH PERMISSIONS
          </button>
        ) : (
          <button
            onClick={handleAction}
            disabled={status === 'scanning' || status === 'success' || !isCameraActive}
            className={`w-full py-5 rounded-2xl font-black text-xs tracking-widest transition-all duration-300 transform active:scale-[0.97] shadow-xl ${
              status === 'idle' && isCameraActive
                ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200' 
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {mode === 'capture' ? (
              <span className="flex items-center justify-center gap-2 uppercase">
                <i className="fas fa-camera-retro"></i> {isCameraActive ? 'Capture For Enrollment' : 'Camera Loading...'}
              </span>
            ) : (status === 'idle' ? 'START BIOMETRIC LOGIN' : status === 'scanning' ? 'ANALYZING...' : 'ACCESS GRANTED')}
          </button>
        )}
      </div>

      <div className="mt-4 min-h-[1.5rem] px-4">
        {errorMessage && status !== 'permission-denied' ? (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-wide animate-pulse">{errorMessage}</p>
        ) : (
            <p className="text-xs text-slate-500 font-medium text-center">
                {mode === 'capture' 
                ? (status === 'captured' ? "Image captured successfully." : "2026 Biometric Enrollment Protocol") 
                : (status === 'idle' ? "GRIET Secure Biometric Authentication" : "Comparing neural features...")}
            </p>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};

export default FaceScanner;
