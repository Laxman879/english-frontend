'use client';
import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  text: string;
  type: 'word' | 'story' | 'example' | 'playlist';
}

interface AudioContextType {
  isPlaying: boolean;
  currentTrack: Track | null;
  queue: Track[];
  play: (track: Track, trackQueue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
}

const AudioCtx = createContext<AudioContextType>({
  isPlaying: false,
  currentTrack: null,
  queue: [],
  play: () => {},
  pause: () => {},
  resume: () => {},
  stop: () => {},
  next: () => {},
  prev: () => {},
});

export const useAudio = () => useContext(AudioCtx);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const indexRef = useRef(0);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
    setIsPlaying(true);
  }, []);

  const play = useCallback((track: Track, trackQueue?: Track[]) => {
    const q = trackQueue || [track];
    const idx = q.findIndex(t => t.id === track.id);
    setQueue(q);
    setCurrentTrack(track);
    indexRef.current = idx >= 0 ? idx : 0;
    speak(track.text);
  }, [speak]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else if (currentTrack) {
      speak(currentTrack.text);
    }
  }, [currentTrack, speak]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentTrack(null);
    setQueue([]);
  }, []);

  const next = useCallback(() => {
    if (indexRef.current < queue.length - 1) {
      indexRef.current += 1;
      const t = queue[indexRef.current];
      setCurrentTrack(t);
      speak(t.text);
    }
  }, [queue, speak]);

  const prev = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      const t = queue[indexRef.current];
      setCurrentTrack(t);
      speak(t.text);
    }
  }, [queue, speak]);

  return (
    <AudioCtx.Provider value={{ isPlaying, currentTrack, queue, play, pause, resume, stop, next, prev }}>
      {children}
    </AudioCtx.Provider>
  );
}
