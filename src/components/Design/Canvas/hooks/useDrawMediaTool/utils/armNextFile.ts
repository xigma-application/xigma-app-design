import { RefObject } from 'react';

// utils
import { createArmedCursor } from './createArmedCursor';
import { loadArmedMedia, TArmedMedia } from './loadArmedMedia';

export const armNextFile = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  armedRef: RefObject<TArmedMedia | null>,
  queueRef: RefObject<File[]>,
): void => {
  const [nextFile, ...rest] = queueRef.current;

  queueRef.current = rest;
  armedRef.current = null;

  if (canvasRef.current) {
    canvasRef.current.style.cursor = '';
  }

  if (nextFile) {
    loadArmedMedia(nextFile, (armed) => {
      armedRef.current = armed;

      createArmedCursor(armed.src, rest.length + 1, (cursorValue) => {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = cursorValue;
        }
      });
    });
  }
};
