// types
import { TGuideLine } from 'types/design/guides/types';
import { TLineSegment } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { screenToWorld } from 'utils/transform/screenToWorld';

export const getGuideSegment = (guide: TGuideLine, canvasWidth: number, canvasHeight: number, viewport: TViewport): TLineSegment => {
  if (guide.span) {
    return guide.axis === 'x'
      ? { x1: guide.worldPosition, x2: guide.worldPosition, y1: guide.span.from, y2: guide.span.to }
      : { x1: guide.span.from, x2: guide.span.to, y1: guide.worldPosition, y2: guide.worldPosition };
  }

  const topLeft = screenToWorld({ x: 0, y: 0 }, viewport);
  const bottomRight = screenToWorld({ x: canvasWidth, y: canvasHeight }, viewport);

  return guide.axis === 'x'
    ? { x1: guide.worldPosition, x2: guide.worldPosition, y1: topLeft.y, y2: bottomRight.y }
    : { x1: topLeft.x, x2: bottomRight.x, y1: guide.worldPosition, y2: guide.worldPosition };
};
