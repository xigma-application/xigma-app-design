// types
import { TAlignmentAxisGuide, TAlignmentGuide } from '../getGroupAlignmentGuide';
import { TCandidateShape } from './getCandidateShapes';
import { TDraftRect, TPoint } from 'types/canvas';

const findMatchedShapeBounds = (candidates: TCandidateShape[], point: TPoint): TDraftRect | undefined =>
  candidates.find((candidate) => candidate.points.some((snapPoint) => snapPoint.x === point.x && snapPoint.y === point.y))?.bounds;

const spanFullElement = (
  axisGuide: TAlignmentAxisGuide,
  candidates: TCandidateShape[],
  axis: 'horizontal' | 'vertical',
): TAlignmentAxisGuide => {
  const bounds = findMatchedShapeBounds(candidates, axisGuide.match);

  /* v8 ignore if -- axisGuide.match always comes from a point drawn from `candidates` itself
     (getGroupAlignmentGuide never invents a match), so the lookup can't fail here */
  if (!bounds) {
    return axisGuide;
  }

  if (axis === 'vertical') {
    return { anchor: { x: axisGuide.match.x, y: bounds.y }, match: { x: axisGuide.match.x, y: bounds.y + bounds.height } };
  }

  return { anchor: { x: bounds.x, y: axisGuide.match.y }, match: { x: bounds.x + bounds.width, y: axisGuide.match.y } };
};

export const extendGuideToFullElement = (guide: TAlignmentGuide | null, candidates: TCandidateShape[]): TAlignmentGuide | null =>
  guide && {
    horizontal: guide.horizontal ? spanFullElement(guide.horizontal, candidates, 'horizontal') : null,
    vertical: guide.vertical ? spanFullElement(guide.vertical, candidates, 'vertical') : null,
  };
