// types
import { TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { TDraftRect } from 'types/canvas';

// utils
import { getRawResizeSnap } from '../getRawResizeSnap';
import { getShapeSnapPoints } from 'components/Design/Canvas/utils/getShapeSnapPoints';

const candidate = (bounds: TDraftRect): TCandidateShape => ({ bounds, points: getShapeSnapPoints(bounds) });

describe('getRawResizeSnap', () => {
  it('should snap the query point when there is no single node origin at all', () => {
    // mock
    const candidateShapes = [candidate({ height: 100, width: 100, x: 200, y: 300 })];

    // result
    expect(getRawResizeSnap({ x: 197, y: 50 }, candidateShapes, 5, null)).toEqual({
      guide: { horizontal: null, vertical: { anchor: { x: 200, y: 300 }, match: { x: 200, y: 400 } } },
      point: { x: 200, y: 50 },
    });
  });

  it('should snap the query point when the single node origin has no rotation and a width', () => {
    // mock
    const candidateShapes = [candidate({ height: 100, width: 100, x: 200, y: 300 })];
    const origin = { flip: null, height: 100, rotation: 0, width: 100, x: 0, y: 0 };

    // result
    expect(getRawResizeSnap({ x: 197, y: 50 }, candidateShapes, 5, origin).point).toEqual({ x: 200, y: 50 });
  });

  it('should skip snapping and pass the query point straight through when the single node origin is rotated', () => {
    // mock — a rotated single origin means the pointer was already rotated back into local space, so
    // snapping against world-space candidates would be meaningless
    const candidateShapes = [candidate({ height: 100, width: 100, x: 200, y: 300 })];
    const origin = { flip: null, height: 100, rotation: 45, width: 100, x: 0, y: 0 };

    // result
    expect(getRawResizeSnap({ x: 197, y: 50 }, candidateShapes, 5, origin)).toEqual({ guide: null, point: { x: 197, y: 50 } });
  });

  it('should skip snapping for a single vector node origin, even unrotated (it has no "width")', () => {
    // mock
    const candidateShapes = [candidate({ height: 100, width: 100, x: 200, y: 300 })];
    const origin = { rotation: 0, segments: {}, vertices: {} };

    // result
    expect(getRawResizeSnap({ x: 197, y: 50 }, candidateShapes, 5, origin)).toEqual({ guide: null, point: { x: 197, y: 50 } });
  });
});
