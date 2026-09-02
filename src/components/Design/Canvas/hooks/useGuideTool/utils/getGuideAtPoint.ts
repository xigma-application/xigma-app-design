// others
import { GUIDE_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { TGuideLine } from 'types/design/guides/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { worldToScreen } from '../../../utils/worldToScreen';

const getGuideScreenPosition = (guide: TGuideLine, viewport: TViewport): number =>
  guide.axis === 'x'
    ? worldToScreen({ x: guide.worldPosition, y: 0 }, viewport).x
    : worldToScreen({ x: 0, y: guide.worldPosition }, viewport).y;

const isWithinGuideSpan = (crossPointer: number, guide: TGuideLine, viewport: TViewport): boolean => {
  if (!guide.span) {
    return true;
  }

  const from =
    guide.axis === 'x' ? worldToScreen({ x: 0, y: guide.span.from }, viewport).y : worldToScreen({ x: guide.span.from, y: 0 }, viewport).x;
  const to =
    guide.axis === 'x' ? worldToScreen({ x: 0, y: guide.span.to }, viewport).y : worldToScreen({ x: guide.span.to, y: 0 }, viewport).x;

  return crossPointer >= Math.min(from, to) && crossPointer <= Math.max(from, to);
};

export const getGuideAtPoint = (pointer: TPoint, guideLines: TGuideLine[], viewport: TViewport): TGuideLine | null => {
  let best: TGuideLine | null = null;
  let bestDistance = Infinity;

  guideLines.forEach((guide) => {
    const alongPointer = guide.axis === 'x' ? pointer.x : pointer.y;
    const crossPointer = guide.axis === 'x' ? pointer.y : pointer.x;
    const distance = Math.abs(alongPointer - getGuideScreenPosition(guide, viewport));

    if (distance > GUIDE_HIT_TOLERANCE_PX || !isWithinGuideSpan(crossPointer, guide, viewport)) {
      return;
    }

    const isBetterMatch = distance < bestDistance || (distance === bestDistance && guide.frameId !== null && best?.frameId === null);

    if (isBetterMatch) {
      best = guide;
      bestDistance = distance;
    }
  });

  return best;
};
