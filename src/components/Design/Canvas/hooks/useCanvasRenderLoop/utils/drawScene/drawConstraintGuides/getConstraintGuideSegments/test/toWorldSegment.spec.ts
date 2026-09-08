// types
import { TConstraintGuideParent } from '../types';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';
import { toWorldSegment } from '../toWorldSegment';

describe('toWorldSegment', () => {
  it('should offset a local segment by the parent position when the parent is unrotated', () => {
    // mock
    const parent: TConstraintGuideParent = { height: 200, rotation: 0, width: 400, x: 100, y: 100 };
    const segment = { from: { x: 10, y: 20 }, to: { x: 30, y: 40 } };

    // action
    const worldSegment = toWorldSegment(segment, parent);

    // result
    expect(worldSegment).toEqual({ x1: 110, x2: 130, y1: 120, y2: 140 });
  });

  it('should rotate both endpoints about the parent centre when the parent is rotated', () => {
    // mock
    const parent: TConstraintGuideParent = { height: 200, rotation: 90, width: 400, x: 100, y: 100 };
    const segment = { from: { x: 0, y: 0 }, to: { x: 100, y: 0 } };
    const centre = { x: parent.x + parent.width / 2, y: parent.y + parent.height / 2 };
    const expectedFrom = rotatePoint({ x: segment.from.x + parent.x, y: segment.from.y + parent.y }, centre, parent.rotation);
    const expectedTo = rotatePoint({ x: segment.to.x + parent.x, y: segment.to.y + parent.y }, centre, parent.rotation);

    // action
    const worldSegment = toWorldSegment(segment, parent);

    // result
    expect(worldSegment.x1).toBeCloseTo(expectedFrom.x);
    expect(worldSegment.y1).toBeCloseTo(expectedFrom.y);
    expect(worldSegment.x2).toBeCloseTo(expectedTo.x);
    expect(worldSegment.y2).toBeCloseTo(expectedTo.y);
  });
});
