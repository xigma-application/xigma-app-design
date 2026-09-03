import { RefObject } from 'react';

// store
import { setMediaToolArmed } from 'store/design/slice';
import { AppDispatch } from 'store';

// utils
import { createArmedCursor } from './createArmedCursor';
import { loadArmedMedia, TArmedMedia } from './loadArmedMedia';

export const armNextFile = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  armedRef: RefObject<TArmedMedia | null>,
  queueRef: RefObject<File[]>,
  dispatch: AppDispatch,
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
      dispatch(setMediaToolArmed(true));

      createArmedCursor(armed.src, rest.length + 1, (cursorValue) => {
        if (canvasRef.current) {
          canvasRef.current.style.cursor = cursorValue;
        }
      });
    });
  }
};
