import { useCallback } from 'react';

// hooks
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

export const useIsPointerOverGradientHandle = (): TFunc<[], boolean> => {
  const canvasRefs = useCanvasRefsContext();

  return useCallback(
    (): boolean =>
      canvasRefs.hover.hoveredGradientStopIndexRef.current !== null ||
      canvasRefs.hover.hoveredGradientLinePositionRef.current !== null ||
      canvasRefs.hover.hoveredGradientRotateEndpointRef.current !== null ||
      canvasRefs.hover.hoveredGradientEndpointMoveRef.current !== null ||
      canvasRefs.hover.hoveredGradientRadiusHandleRef.current !== null ||
      canvasRefs.gradientStop.gradientStopDragRef.current !== null ||
      canvasRefs.gradientRotate.gradientRotateDragRef.current !== null ||
      canvasRefs.gradientEndpointMove.gradientEndpointMoveDragRef.current !== null ||
      canvasRefs.gradientRadius.gradientRadiusDragRef.current !== null,
    [canvasRefs],
  );
};
