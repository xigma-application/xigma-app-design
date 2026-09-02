// types
import { TDraftRect } from 'types/canvas';
import { TGuideLine } from 'types/design/guides/types';

// utils
import { getShapeSnapPoints } from '../getShapeSnapPoints';
import { TCandidateShape } from './getCandidateShapes';

const getGuideBounds = (guide: TGuideLine, viewportWorldRect: TDraftRect): TDraftRect => {
  const span =
    guide.span ??
    (guide.axis === 'x'
      ? { from: viewportWorldRect.y, to: viewportWorldRect.y + viewportWorldRect.height }
      : { from: viewportWorldRect.x, to: viewportWorldRect.x + viewportWorldRect.width });

  return guide.axis === 'x'
    ? { height: span.to - span.from, width: 0, x: guide.worldPosition, y: span.from }
    : { height: 0, width: span.to - span.from, x: span.from, y: guide.worldPosition };
};

export const getGuideCandidateShapes = (guideLines: TGuideLine[], viewportWorldRect: TDraftRect): TCandidateShape[] =>
  guideLines.map((guide) => {
    const bounds = getGuideBounds(guide, viewportWorldRect);

    return { bounds, points: getShapeSnapPoints(bounds) };
  });
