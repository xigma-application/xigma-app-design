// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { formatSvgNumber } from './formatSvgNumber';
import { toSvgPagePoint } from './toSvgPagePoint';

const toPagePoint = (point: TPoint, bounds: TDraftRect): string => {
  const pagePoint = toSvgPagePoint(point, bounds);
  return `${formatSvgNumber(pagePoint.x)} ${formatSvgNumber(pagePoint.y)}`;
};

const getPolygonPathData = (polygon: TPoint[], bounds: TDraftRect): string => {
  const [first, ...rest] = polygon;
  return `M${toPagePoint(first, bounds)} ${rest.map((point) => `L${toPagePoint(point, bounds)}`).join(' ')} Z`;
};

export const getSvgPolygonPathData = (polygons: TPoint[][], bounds: TDraftRect): string =>
  polygons
    .filter((polygon) => polygon.length >= 3)
    .map((polygon) => getPolygonPathData(polygon, bounds))
    .join(' ');
