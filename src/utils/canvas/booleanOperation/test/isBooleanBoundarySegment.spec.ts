// others
import { BOOLEAN_CURVE_BOUNDARY_SAMPLE_OFFSET, BOOLEAN_STRAIGHT_SAMPLE_OFFSET } from '../constants';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { isBooleanBoundarySegment } from '../isBooleanBoundarySegment';

vi.mock('../../vectorNetwork/getVectorSegmentPointAtT', () => ({ getVectorSegmentPointAtT: (): TPoint => ({ x: 0, y: 0 }) }));
vi.mock('../../vectorNetwork/getVectorSegmentNormalAtT', () => ({ getVectorSegmentNormalAtT: (): TPoint => ({ x: 0, y: 1 }) }));

const node = {} as TVectorNode;
const straight = { tangentEnd: null, tangentStart: null } as TVectorSegment;
const curved = { tangentEnd: null, tangentStart: { x: 1, y: 1 } } as TVectorSegment;

describe('isBooleanBoundarySegment', () => {
  it('should be a boundary when one side of the segment is inside and the other is not', () => {
    // result
    expect(isBooleanBoundarySegment(node, straight, (point) => point.y > 0)).toBe(true);
  });

  it('should not be a boundary when both sides agree', () => {
    // result
    expect(isBooleanBoundarySegment(node, straight, () => true)).toBe(false);
  });

  it('should sample closer to a straight segment than to a curved one', () => {
    // mock
    const samples: number[] = [];
    const record = (point: TPoint): boolean => {
      samples.push(Math.abs(point.y));
      return false;
    };

    // before
    isBooleanBoundarySegment(node, straight, record);
    isBooleanBoundarySegment(node, curved, record);

    // result
    expect(samples).toEqual([
      BOOLEAN_STRAIGHT_SAMPLE_OFFSET,
      BOOLEAN_STRAIGHT_SAMPLE_OFFSET,
      BOOLEAN_CURVE_BOUNDARY_SAMPLE_OFFSET,
      BOOLEAN_CURVE_BOUNDARY_SAMPLE_OFFSET,
    ]);
  });
});
