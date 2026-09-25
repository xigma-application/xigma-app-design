// types
import { TVectorDistanceAnchorResult } from '../types';

// utils
import { getAnchorReferencePoint } from '../getAnchorReferencePoint';

describe('getAnchorReferencePoint', () => {
  it('should use a point anchor as it is', () => {
    // result
    expect(getAnchorReferencePoint({ kind: 'point', point: { x: 1, y: 2 } } as unknown as TVectorDistanceAnchorResult)).toEqual({
      x: 1,
      y: 2,
    });
  });

  it('should use the center of a rect anchor', () => {
    // result
    expect(
      getAnchorReferencePoint({ kind: 'rect', rect: { height: 10, width: 20, x: 0, y: 0 } } as unknown as TVectorDistanceAnchorResult),
    ).toEqual({ x: 10, y: 5 });
  });
});
