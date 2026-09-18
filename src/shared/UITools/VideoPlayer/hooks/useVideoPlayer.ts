import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type TUseVideoPlayerResult = {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: TFunc<[number]>;
  onSeekEnd: TFunc;
  onSeekStart: TFunc;
  onTogglePlay: TFunc;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export const useVideoPlayer = (): TUseVideoPlayerResult => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isSeekingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlay = useCallback((): void => setIsPlaying(true), []);
  const handlePause = useCallback((): void => setIsPlaying(false), []);

  const handleLoadedMetadata = useCallback((): void => {
    const video = videoRef.current;

    if (video) {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    }
  }, []);

  const handleTimeUpdate = useCallback((): void => {
    const video = videoRef.current;

    if (video && !isSeekingRef.current) {
      setCurrentTime(video.currentTime);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handlePause);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);

      return (): void => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handlePause);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }

    return undefined;
  }, [handleLoadedMetadata, handlePause, handlePlay, handleTimeUpdate]);

  const onTogglePlay = useCallback((): void => {
    const video = videoRef.current;

    if (video) {
      if (video.paused) {
        void video.play();
      } else {
        video.pause();
      }
    }
  }, []);

  const onSeek = useCallback((value: number): void => {
    const video = videoRef.current;

    if (video) {
      video.currentTime = value;
    }

    setCurrentTime(value);
  }, []);

  const onSeekStart = useCallback((): void => {
    isSeekingRef.current = true;
  }, []);

  const onSeekEnd = useCallback((): void => {
    isSeekingRef.current = false;
  }, []);

  return { currentTime, duration, isPlaying, onSeek, onSeekEnd, onSeekStart, onTogglePlay, videoRef };
};
