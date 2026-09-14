import { useCallback } from 'react';

// hooks
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

export const useIsPointerOverGradientHandle = (): TFunc<[], boolean> => {
  const canvasRefs = useCanvasRefsContext();

  return useCallback(
    (): boolean =>
      canvasRefs.hover.hoveredGradientStopIndexRef.current !== null ||
      canvasRefs.hover.hoveredGradientLinePositionRef.current !== null ||
      canvasRefs.gradientStop.gradientStopDragRef.current !== null,
    [canvasRefs],
  );
};
