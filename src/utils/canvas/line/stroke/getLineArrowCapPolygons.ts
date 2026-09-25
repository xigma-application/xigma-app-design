// others
import { LINE_ARROW_ENDPOINTS } from 'constant/lineEndpoints';

// types
import { LineEndpoint } from 'types/design/enums';
import { TLineFrame } from '../types';
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getLineEndOutlinePoints } from '../../vectorNetwork/getNodeStrokeOutline/getLineEndOutlinePoints/getLineEndOutlinePoints';

const getCapPolygon = (endpoint: LineEndpoint, origin: TPoint, direction: TPoint, halfWidth: number): TPoint[] =>
  getLineEndOutlinePoints(endpoint, halfWidth).map((point) => ({
    x: origin.x + point.x * direction.x - point.y * direction.y,
    y: origin.y + point.x * direction.y + point.y * direction.x,
  }));

export const getLineArrowCapPolygons = (line: TLineNode, frame: TLineFrame): TPoint[][] => {
  const startPoint = line.startPoint ?? LineEndpoint.none;
  const endPoint = line.endPoint ?? LineEndpoint.none;
  const backward = { x: -frame.unit.x, y: -frame.unit.y };

  return [
    ...(LINE_ARROW_ENDPOINTS.includes(startPoint) ? [getCapPolygon(startPoint, frame.start, backward, frame.halfWidth)] : []),
    ...(LINE_ARROW_ENDPOINTS.includes(endPoint) ? [getCapPolygon(endPoint, frame.end, frame.unit, frame.halfWidth)] : []),
  ];
};
