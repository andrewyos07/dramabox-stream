import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Maximize, Minimize, Settings } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onDownload?: () => void;
  thumbnail?: string;
  availableQualities?: number[];
  selectedQuality?: number | null;
  onQualityChange?: (quality: number) => void;
  onVideoEnded?: () => void;
}

export default function VideoPlayer({ 
  src, 
  title, 
  onDownload, 
  thumbnail,
  availableQualities = [],
  selectedQuality = null,
  onQualityChange,
  onVideoEnded
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onVideoEnded) {
        onVideoEnded();
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onVideoEnded]);

  // Reset video when src changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset video state when src changes
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    video.currentTime = 0;
    video.pause();
    
    // Load new source
    video.load();
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      video.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Don't hide controls if quality menu is open
    if (!showQualityMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }
  };

  const handleMouseLeave = () => {
    // Don't hide controls if quality menu is open
    if (isPlaying && !showQualityMenu) {
      setShowControls(false);
    }
  };

  const handleQualityClick = () => {
    if (availableQualities.length > 1) {
      setShowQualityMenu(!showQualityMenu);
    }
  };

  const handleQualitySelect = (quality: number) => {
    if (onQualityChange) {
      onQualityChange(quality);
    }
    setShowQualityMenu(false);
  };

  // Keep controls visible when quality menu is open
  useEffect(() => {
    if (showQualityMenu) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [showQualityMenu]);

  // Close quality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };

    if (showQualityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQualityMenu]);

  return (
    <div
      className="relative w-full bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className="w-full h-auto"
        onClick={togglePlay}
        playsInline
      />
      
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4">
          <h2 className="text-white text-lg font-semibold">{title}</h2>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="text-white hover:text-purple-400 transition-colors p-2"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" fill="white" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="text-white hover:text-purple-400 transition-colors p-2"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {availableQualities.length > 1 && (
            <div className="relative" ref={qualityMenuRef}>
              <button
                onClick={handleQualityClick}
                className="text-white hover:text-purple-400 transition-colors p-2 relative"
                aria-label="Quality Settings"
              >
                <Settings className="w-5 h-5" />
                {selectedQuality && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-purple-600 rounded-full px-1 min-w-[20px] text-center">
                    {selectedQuality}p
                  </span>
                )}
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 min-w-[120px] z-50">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
                      Quality
                    </div>
                    {availableQualities.map((quality) => (
                      <button
                        key={quality}
                        onClick={() => handleQualitySelect(quality)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors ${
                          selectedQuality === quality
                            ? 'text-purple-400 font-semibold'
                            : 'text-white'
                        }`}
                      >
                        {quality}p {selectedQuality === quality && '✓'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {onDownload && (
            <button
              onClick={onDownload}
              className="text-white hover:text-purple-400 transition-colors p-2"
              aria-label="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-purple-400 transition-colors p-2"
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

