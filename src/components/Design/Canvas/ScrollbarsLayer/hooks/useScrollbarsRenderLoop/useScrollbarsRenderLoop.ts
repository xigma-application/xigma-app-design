import { RefObject, useEffect } from 'react';

// types
import { TLayoutRefs } from 'types/design/canvas/types';
import { TFrozenRangeRefs, TScrollbarDragRefs, TScrollbarElementRefs } from '../../types';

// utils
import { renderFrame } from './utils/renderFrame';

export const useScrollbarsRenderLoop = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  layout: TLayoutRefs,
  elements: TScrollbarElementRefs,
  dragging: TScrollbarDragRefs,
  frozenRange: TFrozenRangeRefs,
): void => {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const frameIdRef = { current: 0 };

      const tick = (): void => {
        renderFrame(canvas, layout, elements, dragging, frozenRange);
        frameIdRef.current = requestAnimationFrame(tick);
      };

      frameIdRef.current = requestAnimationFrame(tick);

      return (): void => cancelAnimationFrame(frameIdRef.current);
    }
  }, [canvasRef, dragging, elements, frozenRange, layout]);
};
