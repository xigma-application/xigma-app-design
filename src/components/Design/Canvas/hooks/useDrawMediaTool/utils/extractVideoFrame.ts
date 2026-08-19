// types
import { TArmedMedia } from './loadArmedMedia';

const FRAME_SEEK_OFFSET_SECONDS = 0.1;

const hideVideoElement = (video: HTMLVideoElement): void => {
  video.style.position = 'fixed';
  video.style.width = '1px';
  video.style.height = '1px';
  video.style.opacity = '0';
  video.style.pointerEvents = 'none';
};

const captureVideoFrame = (video: HTMLVideoElement, onLoad: (armed: TArmedMedia) => void): void => {
  const canvas = document.createElement('canvas');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');

  if (context) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        onLoad({ naturalHeight: canvas.height, naturalWidth: canvas.width, src: URL.createObjectURL(blob) });
      }
    }, 'image/png');
  }
};

const cleanupVideoElement = (video: HTMLVideoElement, videoSrc: string): void => {
  video.remove();
  URL.revokeObjectURL(videoSrc);
};

const seekToFrame = (video: HTMLVideoElement, onLoad: (armed: TArmedMedia) => void, onSettled: () => void): void => {
  const seekTime = Number.isFinite(video.duration) && video.duration > 0 ? Math.min(FRAME_SEEK_OFFSET_SECONDS, video.duration / 2) : 0;

  if (seekTime > 0) {
    video.onseeked = (): void => {
      captureVideoFrame(video, onLoad);
      onSettled();
    };
    video.currentTime = seekTime;
  } else {
    captureVideoFrame(video, onLoad);
    onSettled();
  }
};

export const extractVideoFrame = (file: File, onLoad: (armed: TArmedMedia) => void): void => {
  const video = document.createElement('video');
  const videoSrc = URL.createObjectURL(file);

  hideVideoElement(video);
  video.muted = true;
  video.playsInline = true;

  video.onloadeddata = (): void => {
    seekToFrame(video, onLoad, () => cleanupVideoElement(video, videoSrc));
  };

  video.onerror = (): void => {
    cleanupVideoElement(video, videoSrc);
    // eslint-disable-next-line no-console -- no error-reporting/toast channel reaches this handler, so surfacing the failure at all requires the console directly
    console.error('Failed to load video for frame extraction', file.name);
  };

  document.body.appendChild(video);
  video.src = videoSrc;
};
