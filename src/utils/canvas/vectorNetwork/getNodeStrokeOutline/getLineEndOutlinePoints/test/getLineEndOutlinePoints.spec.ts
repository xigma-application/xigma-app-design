// types
import { LineEndpoint } from 'types/design/enums';

// utils
import { getCircleArrowEndPoints } from '../getCircleArrowEndPoints';
import { getDiamondArrowEndPoints } from '../getDiamondArrowEndPoints';
import { getLineArrowEndPoints } from '../getLineArrowEndPoints';
import { getLineEndOutlinePoints } from '../getLineEndOutlinePoints';
import { getReversedTriangleEndPoints } from '../getReversedTriangleEndPoints';
import { getRoundEndPoints } from '../getRoundEndPoints';
import { getSquareEndPoints } from '../getSquareEndPoints';
import { getTriangleArrowEndPoints } from '../getTriangleArrowEndPoints';

describe('getLineEndOutlinePoints', () => {
  it('should close a line end without an endpoint with a flat cap', () => {
    // result
    expect(getLineEndOutlinePoints(undefined, 1)).toEqual([
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ]);
    expect(getLineEndOutlinePoints(LineEndpoint.none, 1)).toEqual([
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ]);
  });

  it('should pick the outline of every endpoint shape', () => {
    // result
    expect(getLineEndOutlinePoints(LineEndpoint.round, 1)).toEqual(getRoundEndPoints(1));
    expect(getLineEndOutlinePoints(LineEndpoint.square, 1)).toEqual(getSquareEndPoints(1));
    expect(getLineEndOutlinePoints(LineEndpoint.lineArrow, 1)).toEqual(getLineArrowEndPoints(1));
    expect(getLineEndOutlinePoints(LineEndpoint.triangleArrow, 1)).toEqual(getTriangleArrowEndPoints(1));
    expect(getLineEndOutlinePoints(LineEndpoint.reversedTriangle, 1)).toEqual(getReversedTriangleEndPoints(1));
    expect(getLineEndOutlinePoints(LineEndpoint.circleArrow, 1)).toEqual(getCircleArrowEndPoints(1));
    expect(getLineEndOutlinePoints(LineEndpoint.diamondArrow, 1)).toEqual(getDiamondArrowEndPoints(1));
  });
});
