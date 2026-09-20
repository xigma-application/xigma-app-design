// types
import { TCanvasRefs, TProgressiveBlurEndpoint } from 'types/design/canvas/types';

export const getActiveProgressiveBlurEndpoint = (
  refs: TCanvasRefs,
  nodeId: string,
  effectIndex: number,
): TProgressiveBlurEndpoint | null => {
  const dragState = refs.progressiveBlur.dragRef.current;

  if (dragState) {
    return dragState.nodeId === nodeId && dragState.effectIndex === effectIndex ? dragState.endpoint : null;
  }

  return refs.progressiveBlur.hoveredEndpointRef.current;
};
