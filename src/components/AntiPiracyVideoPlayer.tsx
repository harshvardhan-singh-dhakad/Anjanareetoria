"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Settings
} from 'lucide-react';

interface AntiPiracyVideoPlayerProps {
  videoUrl: string;
  videoType: 'youtube' | 'direct_hls' | 'mp4' | 'bunny';
  title?: string;
  poster?: string;
  userPhone?: string | null;
  userName?: string | null;
  autoPlay?: boolean;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const AntiPiracyVideoPlayer: React.FC<AntiPiracyVideoPlayerProps> = ({
  videoUrl,
  videoType,
  title,
  poster,
  userPhone,
  userName,
  autoPlay = false,
  onEnded,
  onTimeUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [screenWarning, setScreenWarning] = useState<string | null>(null);

  // Dynamic Moving Watermark Position
  // Coordinates in percentage: top & left
  const [watermarkPos, setWatermarkPos] = useState({ top: '15%', left: '20%' });
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Clean identifier for forensic watermark
  const cleanPhone = userPhone ? userPhone.replace(/\D/g, '').slice(-10) : 'DEVOTEE';
  const displayName = userName || 'Sacred Seeker';

  // Periodic random shift of the forensic watermark across the player
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-IN', { hour12: false }));
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    const positions = [
      { top: '12%', left: '15%' },
      { top: '25%', left: '60%' },
      { top: '45%', left: '25%' },
      { top: '65%', left: '55%' },
      { top: '80%', left: '20%' },
      { top: '75%', left: '70%' },
      { top: '35%', left: '40%' },
    ];

    let posIdx = 0;
    const moveInterval = setInterval(() => {
      posIdx = (posIdx + 1) % positions.length;
      setWatermarkPos(positions[posIdx]);
    }, 11000); // changes position every 11 seconds

    return () => {
      clearInterval(timeInterval);
      clearInterval(moveInterval);
    };
  }, []);

  // Screen capture & inspect key deterrence
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen or F12 or Ctrl+Shift+I or Ctrl+Shift+C
      if (
        e.key === 'PrintScreen' ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))
      ) {
        setScreenWarning('Protected Spiritual Content: Screen capture is disabled.');
        setTimeout(() => setScreenWarning(null), 4000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Video control helpers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTo = Number(e.target.value);
    videoRef.current.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(videoRef.current.currentTime + seconds, 0),
      duration
    );
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Extract YouTube ID safely
  const getYouTubeEmbedUrl = (urlOrId: string) => {
    let videoId = urlOrId;
    if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
      const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&autoplay=${autoPlay ? 1 : 0}`;
  };

  const isYouTube = videoType === 'youtube' || videoUrl.includes('youtube') || videoUrl.includes('youtu.be');

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none border border-slate-800"
    >
      {/* Screen capture alert overlay */}
      {screenWarning && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-red-950/80 border border-red-500/50 rounded-2xl p-6 text-center max-w-sm text-white space-y-3">
            <AlertTriangle size={36} className="text-red-400 mx-auto" />
            <h4 className="font-bold text-sm uppercase tracking-wider text-red-200">Security Warning</h4>
            <p className="text-xs text-red-300/90">{screenWarning}</p>
          </div>
        </div>
      )}

      {/* DYNAMIC FORENSIC WATERMARK (Anti-Piracy) */}
      <div
        style={{
          top: watermarkPos.top,
          left: watermarkPos.left,
          transition: 'top 3s ease-in-out, left 3s ease-in-out',
        }}
        className="pointer-events-none absolute z-30 flex items-center space-x-1.5 px-3 py-1 rounded-md bg-black/40 backdrop-blur-[2px] border border-white/10 text-white/45 font-mono text-[11px] select-none uppercase tracking-wider"
      >
        <ShieldCheck size={13} className="text-emerald-400/50" />
        <span>
          {cleanPhone} • {displayName} • {currentTimeStr}
        </span>
      </div>

      {/* Secondary subtle permanent watermark in top corner */}
      <div className="pointer-events-none absolute top-3 right-4 z-30 text-[10px] font-mono text-white/20 select-none uppercase">
        UID: {cleanPhone.slice(-6)} • AR BLESSINGS
      </div>

      {/* VIDEO ENGINE */}
      {isYouTube ? (
        <div className="relative w-full h-full">
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            title={title || 'Sacred Video Teaching'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={poster}
            playsInline
            controls={false}
            autoPlay={autoPlay}
            onTimeUpdate={() => {
              if (!videoRef.current) return;
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 0);
              onTimeUpdate?.(videoRef.current.currentTime, videoRef.current.duration || 0);
            }}
            onEnded={() => {
              setIsPlaying(false);
              onEnded?.();
            }}
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Center Play Button when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute z-20 w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition duration-200"
              aria-label="Play Video"
            >
              <Play size={28} className="ml-1" />
            </button>
          )}

          {/* CUSTOM PLAYER CONTROLS */}
          <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex flex-col space-y-2">
            {/* Scrubber timeline */}
            <div className="flex items-center space-x-3 w-full">
              <span className="text-[11px] font-mono text-slate-300">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1346af]"
              />
              <span className="text-[11px] font-mono text-slate-300">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom buttons bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlay}
                  className="p-1.5 text-white hover:text-amber-400 transition"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  onClick={() => handleSkip(-10)}
                  className="p-1.5 text-slate-300 hover:text-white transition"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw size={16} />
                </button>

                <button
                  onClick={() => handleSkip(10)}
                  className="p-1.5 text-slate-300 hover:text-white transition"
                  title="Forward 10 seconds"
                >
                  <RotateCw size={16} />
                </button>

                {/* Volume control */}
                <div className="flex items-center space-x-1.5 ml-2">
                  <button
                    onClick={() => {
                      if (!videoRef.current) return;
                      const next = !isMuted;
                      setIsMuted(next);
                      videoRef.current.muted = next;
                    }}
                    className="p-1 text-slate-300 hover:text-white transition"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setVolume(val);
                      setIsMuted(val === 0);
                      if (videoRef.current) {
                        videoRef.current.volume = val;
                        videoRef.current.muted = val === 0;
                      }
                    }}
                    className="w-16 h-1 bg-slate-700 rounded appearance-none accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 relative">
                {/* Speed selector menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2 py-1 text-xs font-semibold text-slate-300 hover:text-white rounded bg-slate-800/80 hover:bg-slate-700 transition"
                  >
                    {playbackSpeed}x
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-8 right-0 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-40 flex flex-col space-y-1 min-w-[70px]">
                      {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-2 py-1 text-[11px] rounded font-mono text-left transition ${
                            playbackSpeed === s
                              ? 'bg-blue-600 text-white font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-slate-300 hover:text-white transition"
                  title="Fullscreen"
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
