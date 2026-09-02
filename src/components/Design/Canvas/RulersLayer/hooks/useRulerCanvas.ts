import debounce from 'lodash/debounce';
import { RefObject, useEffect } from 'react';

// others
import { RESIZE_DEBOUNCE_MS } from '../../constants';

// utils
import { sizeRulerCanvas } from '../utils/sizeRulerCanvas';

export const useRulerCanvas = (canvasRef: RefObject<HTMLCanvasElement | null>, enabled: boolean): void => {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && enabled) {
      sizeRulerCanvas(canvas);

      const debouncedResize = debounce(() => sizeRulerCanvas(canvas), RESIZE_DEBOUNCE_MS);
      const resizeObserver = new ResizeObserver(debouncedResize);

      resizeObserver.observe(canvas);

      return (): void => {
        debouncedResize.cancel();
        resizeObserver.disconnect();
      };
    }
  }, [canvasRef, enabled]);
};
