// types
import { TGuideAxis, TGuideLine } from 'types/design/guides/types';
import { TGuideRefs } from 'types/design/canvas/types';

export type THighlightedRulerGuide = {
  axis: TGuideAxis;
  worldPosition: number;
};

export const getHighlightedRulerGuide = (guides: TGuideRefs, guideLines: TGuideLine[]): THighlightedRulerGuide | null => {
  const dragging = guides.draggingGuideRef.current;

  if (!dragging) {
    const hoveredId = guides.hoveredGuideRef.current?.id;
    const hoveredGuide = hoveredId ? guideLines.find((line) => line.id === hoveredId) : undefined;

    return hoveredGuide ? { axis: hoveredGuide.axis, worldPosition: hoveredGuide.worldPosition } : null;
  }

  return { axis: dragging.axis, worldPosition: dragging.position };
};
