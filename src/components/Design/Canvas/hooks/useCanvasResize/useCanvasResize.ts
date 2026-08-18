import debounce from 'lodash/debounce';
import { useEffect } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// others
import { RESIZE_DEBOUNCE_MS } from '../../constants';

// utils
import { resizeCanvas } from './utils/resizeCanvas';

export const useCanvasResize = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;

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
