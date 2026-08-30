// types
import { TCandidateShape } from '../getDragAlignmentSnap/getCandidateShapes';
import { TDraftRect } from 'types/canvas';

// utils
import { getPointAlignmentSnap } from '../getPointAlignmentSnap';
import { getShapeSnapPoints } from '../getShapeSnapPoints';

const candidate = (bounds: TDraftRect): TCandidateShape => ({ bounds, points: getShapeSnapPoints(bounds) });

describe('getPointAlignmentSnap', () => {
  it('should return the raw point and no guide when nothing is within tolerance', () => {
    // action
    const result = getPointAlignmentSnap({ x: 197, y: 50 }, [], 5);

    // result
    expect(result).toEqual({ guide: null, point: { x: 197, y: 50 } });
  });

  it('should snap the point onto a nearby candidate and draw the guide along that candidate’s full height', () => {
    // mock — a candidate rect whose left edge sits 3px past the raw point on the x axis
    const candidateShapes = [candidate({ height: 100, width: 100, x: 200, y: 300 })];

    // action
    const result = getPointAlignmentSnap({ x: 197, y: 50 }, candidateShapes, 5);

    // result — x snaps to 200, y is untouched (no candidate point near y:50); the guide spans b's
    // full height (300..400)
    expect(result.point).toEqual({ x: 200, y: 50 });
    expect(result.guide).toEqual({ horizontal: null, vertical: { anchor: { x: 200, y: 300 }, match: { x: 200, y: 400 } } });
  });

  it('should snap the point onto a nearby candidate and draw the guide along that candidate’s full width', () => {
    // mock — a candidate rect whose top edge sits 3px past the raw point on the y axis
    const candidateShapes = [candidate({ height: 100, width: 100, x: 300, y: 200 })];

    // action
    const result = getPointAlignmentSnap({ x: 50, y: 197 }, candidateShapes, 5);

    // result — y snaps to 200, x is untouched; the guide spans b's full width (300..400)
    expect(result.point).toEqual({ x: 50, y: 200 });
    expect(result.guide).toEqual({ horizontal: { anchor: { x: 300, y: 200 }, match: { x: 400, y: 200 } }, vertical: null });
  });
});
