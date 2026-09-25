// types
import { LineEndpoint } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getCircleArrowEndPoints } from './getCircleArrowEndPoints';
import { getDiamondArrowEndPoints } from './getDiamondArrowEndPoints';
import { getLineArrowEndPoints } from './getLineArrowEndPoints';
import { getReversedTriangleEndPoints } from './getReversedTriangleEndPoints';
import { getRoundEndPoints } from './getRoundEndPoints';
import { getSquareEndPoints } from './getSquareEndPoints';
import { getTriangleArrowEndPoints } from './getTriangleArrowEndPoints';

export const getLineEndOutlinePoints = (endpoint: LineEndpoint | undefined, halfWidth: number): TPoint[] => {
  switch (endpoint) {
    case LineEndpoint.round:
      return getRoundEndPoints(halfWidth);
    case LineEndpoint.square:
      return getSquareEndPoints(halfWidth);
    case LineEndpoint.lineArrow:
      return getLineArrowEndPoints(halfWidth);
    case LineEndpoint.triangleArrow:
      return getTriangleArrowEndPoints(halfWidth);
    case LineEndpoint.reversedTriangle:
      return getReversedTriangleEndPoints(halfWidth);
    case LineEndpoint.circleArrow:
      return getCircleArrowEndPoints(halfWidth);
    case LineEndpoint.diamondArrow:
      return getDiamondArrowEndPoints(halfWidth);
    default:
      return [
        { x: 0, y: halfWidth },
        { x: 0, y: -halfWidth },
      ];
  }
};
