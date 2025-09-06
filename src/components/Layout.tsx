import React, { ReactNode, useRef, useState, useEffect } from "react";
import { Home, Search, PlusSquare, Heart, User, Camera } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleCameraClick = () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      fileInputRef.current?.click();
    } else {
      setShowWebcam(true);
    }
  };

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      navigate("/upload", { state: { capturedImage: file } });
    }
  };

  useEffect(() => {
    if (showWebcam && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error("Error accessing webcam:", err);
          setShowWebcam(false);
        });
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [showWebcam]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
          navigate("/upload", { state: { capturedImage: file } });
          setShowWebcam(false);
        }
      }, "image/jpeg");
    }
  };

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Search, path: "/explore", label: "Explore" },
    { icon: PlusSquare, path: "/upload", label: "Upload" },
    { icon: Heart, path: "/notifications", label: "Notifications" },
    { icon: User, path: `/profile/${user?.username}`, label: "Profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={handleCameraClick}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Vistagram</h1>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageCapture}
            className="hidden"
          />

          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="w-2 h-2 bg-blue-400 rounded-full" />
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
          </div>
        </div>
      </header>

      {/* Webcam Modal */}
      {showWebcam && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[100] p-4">
          <video
            ref={videoRef}
            className="rounded-lg mb-4 max-w-full shadow-lg"
          />
          <div className="flex gap-4">
            <button
              onClick={takePhoto}
              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition-colors font-medium"
            >
              Take Photo
            </button>
            <button
              onClick={() => setShowWebcam(false)}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 pt-16 pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
          {navItems.map(({ icon: Icon, path, label }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all ${
                isActive(path)
                  ? "text-purple-400 bg-purple-400/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                size={22}
                className={isActive(path) ? "scale-110" : "hover:scale-105"}
              />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
