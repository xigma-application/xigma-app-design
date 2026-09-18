// types
import { TContrastBoundary, TContrastCurvePoint } from '../types';

const getSingleBoundaryFailRegion = (boundary: TContrastBoundary): TContrastCurvePoint[] => {
  const edgeV = boundary.passSide === 'lighter' ? 0 : 100;
  const edge = [...boundary.points].reverse().map((point) => ({ s: point.s, v: edgeV }));

  return [...boundary.points, ...edge];
};

const getBetweenBoundariesFailRegion = (lighter: TContrastBoundary, darker: TContrastBoundary): TContrastCurvePoint[] | null => {
  const darkerSaturations = new Set(darker.points.map((point) => point.s));
  const topEdge = lighter.points.filter((point) => darkerSaturations.has(point.s));
  const lighterSaturations = new Set(topEdge.map((point) => point.s));
  const bottomEdge = [...darker.points].reverse().filter((point) => lighterSaturations.has(point.s));

  if (topEdge.length > 0 && bottomEdge.length > 0) {
    return [...topEdge, ...bottomEdge];
  }

  return null;
};

export const getFailRegionPolygon = (boundaries: TContrastBoundary[]): TContrastCurvePoint[] | null => {
  switch (boundaries.length) {
    case 1:
      return getSingleBoundaryFailRegion(boundaries[0]);
    case 2: {
      const lighter = boundaries.find((boundary) => boundary.passSide === 'lighter');
      const darker = boundaries.find((boundary) => boundary.passSide === 'darker');

      return lighter && darker ? getBetweenBoundariesFailRegion(lighter, darker) : null;
    }
    default:
      return null;
  }
};
