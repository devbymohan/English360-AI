import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../utils/cn';

const SPEED_OPTIONS = [1.0, 1.25, 1.5, 2.0];

export const AudioPlayer = ({
  title = 'Conversation',
  subtitle = 'Listen carefully',
  scriptText = '',
  waveform = [30, 45, 60, 80, 50, 90, 75, 40, 65, 85, 95, 70, 55, 60, 45, 35, 70, 80, 60, 50, 40, 30, 20, 15, 25, 40, 55, 70, 65, 50, 40, 30],
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  const timerRef = useRef(null);
  const utteranceRef = useRef(null);
  const wordsRef = useRef([]);

  // Calculate real duration based on transcript word count (140 words per minute average conversational rate)
  const words = scriptText ? scriptText.trim().split(/\s+/).filter(Boolean) : [];
  const baseDuration = Math.max(20, Math.round((words.length / 140) * 60));
  const realDuration = baseDuration;

  wordsRef.current = words;

  // Reset audio player when a new lesson / script arrives
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    clearInterval(timerRef.current);
  }, [scriptText]);

  const speakFromOffset = (offsetSecs, currentSpeed = speed) => {
    if (!('speechSynthesis' in window) || !scriptText) return;

    window.speechSynthesis.cancel();
    if (isMuted) return;

    // Calculate approximate word offset from time
    const ratio = realDuration > 0 ? Math.min(0.99, offsetSecs / realDuration) : 0;
    const wordStartIndex = Math.floor(ratio * words.length);
    const textToSpeak = words.slice(wordStartIndex).join(' ');

    if (!textToSpeak.trim()) {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = currentSpeed;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(realDuration);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Timer loop for time tracking
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= realDuration) {
            setIsPlaying(false);
            stopSpeech();
            return realDuration;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, speed, realDuration]);

  const togglePlay = () => {
    if (!isPlaying) {
      const startAt = currentTime >= realDuration ? 0 : currentTime;
      if (currentTime >= realDuration) setCurrentTime(0);
      setIsPlaying(true);
      speakFromOffset(startAt, speed);
    } else {
      setIsPlaying(false);
      stopSpeech();
    }
  };

  const handleSeek = (newSecs) => {
    const clamped = Math.min(realDuration, Math.max(0, Math.round(newSecs)));
    setCurrentTime(clamped);
    if (isPlaying) {
      speakFromOffset(clamped, speed);
    }
  };

  const skipTime = (seconds) => {
    handleSeek(currentTime + seconds);
  };

  const handleSpeedChange = () => {
    const nextIdx = (SPEED_OPTIONS.indexOf(speed) + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIdx];
    setSpeed(newSpeed);
    if (isPlaying) {
      speakFromOffset(currentTime, newSpeed);
    }
  };

  const formatTime = (secs) => {
    const sInt = Math.max(0, Math.floor(secs));
    const m = Math.floor(sInt / 60);
    const s = sInt % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = realDuration > 0 ? (currentTime / realDuration) * 100 : 0;
  const activeBarsCount = Math.floor((progressPercent / 100) * waveform.length);

  return (
    <div className={cn('bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-card space-y-3 sm:space-y-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{title}</h4>
          <p className="text-[11px] sm:text-xs text-slate-400 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleSpeedChange}
            className="text-xs font-bold px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Toggle playback speed (1x, 1.25x, 1.5x, 2x)"
          >
            {speed}x
          </button>
          <button
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (nextMute) {
                stopSpeech();
              } else if (isPlaying) {
                speakFromOffset(currentTime, speed);
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Waveform Bars */}
      <div
        className="h-14 sm:h-16 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 bg-slate-50 rounded-2xl border border-slate-100/80 cursor-pointer overflow-hidden select-none"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          handleSeek(ratio * realDuration);
        }}
      >
        {waveform.map((val, idx) => {
          const isActive = idx <= activeBarsCount;
          return (
            <div
              key={idx}
              className={cn(
                'flex-1 rounded-full transition-all duration-150',
                isActive ? 'bg-brand-600' : 'bg-slate-200 hover:bg-slate-300'
              )}
              style={{ height: `${val}%` }}
            />
          );
        })}
      </div>

      {/* Time & Controls */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 font-mono">
          {formatTime(currentTime)}
        </span>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => skipTime(-10)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-500/20 transition transform active:scale-95 shrink-0"
            title={isPlaying ? 'Pause' : 'Play audio'}
          >
            {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />}
          </button>

          <button
            onClick={() => skipTime(10)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[11px] sm:text-xs font-semibold text-slate-400 font-mono">
          {formatTime(realDuration)}
        </span>
      </div>
    </div>
  );
};
