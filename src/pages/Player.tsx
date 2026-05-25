import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, RotateCcw, StepForward, List, 
  Play, Pause, Maximize, Minus, Plus, Check, Volume2, VolumeX
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

// 1. Define the TypeScript interface matching your Rust StreamResult struct
interface StreamResult {
  source_name: string;
  url: string;
  quality: string;
  is_m3u8: boolean;
  referer?: string;
  origin?: string; // Adding origin just in case you use it later
}

// 2. Helper to route protected URLs through our local Rust proxy
const createProxyUrl = (targetUrl: string, referer?: string, origin?: string) => {
  // Base64 encode the URL for safe transport to the Rust backend
  const encodedUrl = btoa(targetUrl);
  let proxyUrl = `http://127.0.0.1:8765/proxy?url=${encodedUrl}`;
  if (referer) proxyUrl += `&referer=${encodeURIComponent(referer)}`;
  if (origin) proxyUrl += `&origin=${encodeURIComponent(origin)}`;
  return proxyUrl;
};

export default function Player() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Menu & Source States
  const [activeMenu, setActiveMenu] = useState<'none' | 'speed' | 'source'>('none');
  const [selectedSub, setSelectedSub] = useState('No Subtitles');
  
  // NEW: Dynamic streams from Rust
  const [streams, setStreams] = useState<StreamResult[]>([]);
  const [selectedStream, setSelectedStream] = useState<StreamResult | null>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // INITIALIZE STREAM (CALLING RUST)
  // ==========================================
  useEffect(() => {
    const initializeStream = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        // 3. Call the Rust backend command
        // Note: Tauri converts JS camelCase (mediaType) to Rust snake_case (media_type)
        const scrapedData: StreamResult[] = await invoke('search_streams', { 
          query: id || "demo", 
          mediaType: "movie" 
        });

        if (scrapedData && scrapedData.length > 0) {
          setStreams(scrapedData);
          
          // Auto-select the first available stream
          const bestStream = scrapedData[0];
          setSelectedStream(bestStream);
          
          // Generate proxy URL and feed it to the video player
          const proxiedUrl = createProxyUrl(bestStream.url, bestStream.referer);
          setStreamUrl(proxiedUrl);
        } else {
          setErrorMsg('No streams found. The site may be down.');
        }

      } catch (error) {
        console.error("Failed to fetch streams from Rust:", error);
        setErrorMsg('Failed to connect to provider engine.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeStream();
  }, [id]);

  // ==========================================
  // VIDEO EVENT LISTENERS
  // ==========================================
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    
    // Autoplay when url loads (Requires user interaction in some browsers, but fine for desktop apps)
    if (streamUrl) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [streamUrl]);

  // ==========================================
  // PLAYBACK CONTROLS
  // ==========================================
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - bounds.left) / bounds.width;
      const newTime = percent * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // ==========================================
  // ACTIVITY & KEYBOARD SHORTCUTS
  // ==========================================
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (activeMenu === 'none') {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleUserActivity();
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) playerRef.current?.requestFullscreen();
          else document.exitFullscreen();
          break;
        case 'ArrowRight':
          if (videoRef.current) videoRef.current.currentTime = Math.min(currentTime + 10, duration);
          break;
        case 'ArrowLeft':
          if (videoRef.current) videoRef.current.currentTime = Math.max(currentTime - 10, 0);
          break;
        case 'Escape':
          if (activeMenu !== 'none') setActiveMenu('none');
          else if (document.fullscreenElement) document.exitFullscreen();
          else navigate(-1);
          break;
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleKeyDown);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [activeMenu, currentTime, duration, navigate, isPlaying]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={playerRef}
      className="relative flex h-screen w-screen flex-col bg-black overflow-hidden font-sans"
    >
      {/* ==========================================
          THE ACTUAL VIDEO PLAYER
          ========================================== */}
      {streamUrl && (
        <video
          ref={videoRef}
          src={streamUrl}
          className="absolute inset-0 h-full w-full object-contain bg-black"
          onClick={togglePlay}
          onDoubleClick={() => {
            if (!document.fullscreenElement) playerRef.current?.requestFullscreen();
            else document.exitFullscreen();
          }}
        />
      )}

      {/* ==========================================
          LOADING & ERROR OVERLAYS
          ========================================== */}
      {isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
          <p className="mt-4 text-brand-light font-medium tracking-wider drop-shadow-md">Engaging Scrapers...</p>
        </div>
      )}

      {errorMsg && !isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
          <p className="text-brand-red text-xl font-bold">{errorMsg}</p>
          <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors">
            Go Back
          </button>
        </div>
      )}

      {/* ==========================================
          UI CONTROLS OVERLAY
          ========================================== */}
      <div 
        className={`absolute inset-0 z-30 flex flex-col justify-between transition-opacity duration-300 ${
          showControls || activeMenu !== 'none' || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.9) 100%)'
        }}
      >
        {/* --- TOP BAR --- */}
        <div className="flex items-start justify-between p-6 pointer-events-none">
          <div className="flex gap-6 pointer-events-auto">
            <button 
              onClick={() => navigate(-1)}
              className="text-white transition-colors hover:text-brand-red drop-shadow-lg"
            >
              <ArrowLeft size={28} />
            </button>
          </div>

          <div className="text-right pointer-events-auto">
            <h1 className="text-lg font-bold text-white drop-shadow-md">
              Now Playing
            </h1>
            <p className="text-sm text-gray-300 drop-shadow-md">
              {selectedStream ? `${selectedStream.source_name} [${selectedStream.quality}]` : 'Loading...'}
            </p>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div className="flex w-full flex-col px-6 pb-6">
          
          {/* Custom Seekbar */}
          <div 
            onClick={handleSeek}
            className="group relative mb-4 flex h-6 w-full cursor-pointer items-center"
          >
            <div className="absolute h-1.5 w-full rounded-full bg-white/30 transition-all group-hover:h-2" />
            <div 
              className="absolute h-1.5 rounded-full bg-brand-red transition-all group-hover:h-2"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div 
              className="absolute h-4 w-4 -ml-2 rounded-full bg-brand-red opacity-0 transition-opacity group-hover:opacity-100 shadow-[0_0_10px_rgba(229,9,20,0.8)]"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-white">
              <button 
                onClick={togglePlay}
                className="transition-transform hover:scale-110 drop-shadow-lg"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>

              <button onClick={toggleMute} className="transition-colors hover:text-brand-red drop-shadow-md">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <span className="text-sm font-medium tracking-wide drop-shadow-md">
                {formatTime(currentTime)} <span className="text-white/50 px-1">/</span> {formatTime(duration)}
              </span>
            </div>

            {/* Right Action Pills */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (!document.fullscreenElement) playerRef.current?.requestFullscreen();
                  else document.exitFullscreen();
                }}
                className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <Maximize size={14} /> Fullscreen
              </button>

              <button 
                onClick={() => setActiveMenu(activeMenu === 'speed' ? 'none' : 'speed')}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors ${
                  activeMenu === 'speed' ? 'bg-brand-red shadow-[0_0_10px_rgba(229,9,20,0.4)]' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Speed ({playbackSpeed.toFixed(2)}x)
              </button>

              <button 
                onClick={() => setActiveMenu(activeMenu === 'source' ? 'none' : 'source')}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors ${
                  activeMenu === 'source' ? 'bg-brand-red shadow-[0_0_10px_rgba(229,9,20,0.4)]' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <List size={14} /> Source
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          MODALS / MENUS
          ========================================== */}
          
      {/* 1. SPEED MENU */}
      {activeMenu === 'speed' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveMenu('none')}>
          <div 
            className="flex w-full max-w-3xl flex-col rounded-xl bg-[#0a0a0a] p-8 shadow-2xl border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="mb-8 text-center text-xl font-medium text-white">{playbackSpeed.toFixed(2)}x</h3>
            
            <div className="mb-10 flex items-center gap-4">
              <button onClick={() => setPlaybackSpeed(Math.max(0.25, playbackSpeed - 0.25))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20">
                <Minus size={20} />
              </button>
              <div className="relative flex h-2 flex-1 items-center rounded-full bg-white/20">
                <div className="absolute h-full rounded-full bg-white" style={{ width: `${(playbackSpeed / 2) * 100}%` }} />
                <div className="absolute h-6 w-6 -ml-3 rounded-full bg-brand-red shadow-[0_0_10px_rgba(229,9,20,0.8)]" style={{ left: `${(playbackSpeed / 2) * 100}%` }} />
              </div>
              <button onClick={() => setPlaybackSpeed(Math.min(2.0, playbackSpeed + 0.25))} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20">
                <Plus size={20} />
              </button>
            </div>

            <div className="flex gap-2">
              {[0.25, 1.0, 1.25, 1.5, 2.0].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-colors ${
                    playbackSpeed === speed ? 'bg-brand-red text-white' : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  {speed.toFixed(2)}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SOURCE & SUBTITLE MENU */}
      {activeMenu === 'source' && (
        <div className="absolute inset-0 z-50 flex flex-col bg-black/95 p-10 text-white animate-in fade-in duration-200">
          <div className="flex flex-1 gap-10">
            
            {/* Dynamic Sources Column */}
            <div className="flex-1 border-r border-white/10 pr-10">
              <div className="mb-6 flex items-center justify-between text-sm text-gray-400">
                <span className="font-bold text-white text-lg">Found Streams</span>
                <span>Auto Select ⚙️</span>
              </div>
              
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[70vh] no-scrollbar">
                {streams.length > 0 ? streams.map((stream, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setSelectedStream(stream);
                      setStreamUrl(createProxyUrl(stream.url, stream.referer));
                      setIsPlaying(false); // Pause slightly while changing source
                    }}
                    className={`flex items-start gap-4 rounded p-3 text-left transition-colors hover:bg-white/5 ${
                      selectedStream?.url === stream.url ? 'text-white font-medium bg-white/10' : 'text-gray-400'
                    }`}
                  >
                    <div className="mt-1 flex w-6 justify-center">
                      {selectedStream?.url === stream.url && <Check size={16} className="text-brand-red" />}
                    </div>
                    <div className="whitespace-pre-line text-sm leading-relaxed flex flex-col">
                      <span className="font-bold">{stream.source_name} [{stream.quality}]</span>
                      <span className="text-xs opacity-70">
                        {stream.is_m3u8 ? 'HLS Stream 📡' : 'Direct MP4 📀'}
                      </span>
                    </div>
                  </button>
                )) : (
                  <p className="text-gray-500">No alternate sources found.</p>
                )}
              </div>
            </div>

            {/* Subtitles Column (Static for now) */}
            <div className="flex-1 pl-4">
              <div className="mb-6 flex items-center justify-between text-sm text-gray-400">
                <span className="font-bold text-white text-lg">Subtitles</span>
                <span>Auto</span>
              </div>
              
              <div className="flex flex-col gap-2">
                {[
                  { icon: Check, label: 'No Subtitles' },
                  { icon: Plus, label: 'English (Auto-generated)' },
                  { icon: Plus, label: 'Spanish' },
                  { icon: Plus, label: 'Load from file' }
                ].map((sub, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedSub(sub.label)}
                    className={`flex items-center gap-4 p-3 text-left text-sm transition-colors hover:text-white ${
                      selectedSub === sub.label ? 'text-white font-medium bg-white/10 rounded' : 'text-gray-400'
                    }`}
                  >
                    <sub.icon size={16} className={selectedSub === sub.label ? 'text-brand-red' : 'opacity-70'} />
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
            
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10 mt-6">
            <button 
              onClick={() => setActiveMenu('none')}
              className="rounded px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button 
              onClick={() => setActiveMenu('none')}
              className="rounded bg-brand-red px-8 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-[0_0_15px_rgba(229,9,20,0.5)]"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}