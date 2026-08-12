import debounce from 'lodash/debounce';
import { RefObject, useEffect } from 'react';

// others
import { RESIZE_DEBOUNCE_MS } from '../../constants';

// utils
import { resizeCanvas } from './utils/resizeCanvas';

export const useCanvasResize = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      resizeCanvas(canvas);

      const debouncedResize = debounce(() => resizeCanvas(canvas), RESIZE_DEBOUNCE_MS);
      const resizeObserver = new ResizeObserver(debouncedResize);

      resizeObserver.observe(canvas);

      return (): void => {
        debouncedResize.cancel();
        resizeObserver.disconnect();
      };
    }
  }, [canvasRef]);
};
