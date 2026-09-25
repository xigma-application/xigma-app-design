// types
import { StrokeAlign } from 'types/design/enums';
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TPoint } from 'types/canvas';
import { TRingMode } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/types';
import { TVectorNode } from 'types/design/types';
import { TVectorStrokePath } from './types';

// utils
import { getAlignedStrokeBand } from 'utils/canvas/shapes/getAlignedStrokeBand';
import { getAlignedStrokeMidline } from 'utils/canvas/shapes/getAlignedStrokeMidline';
import { buildOpenPolylineStrokeRing } from './buildOpenPolylineStrokeRing';
import { getOpenPathModeShape } from './getOpenPathModeShape';
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';
import { getVectorModeStrokePolygons } from './getVectorModeStrokePolygons';

const getUniformClosedPathPolygons = (node: TVectorNode, points: TVectorStrokePath['points'], isHole: boolean): TPoint[][] => {
  const align = node.strokeAlign ?? StrokeAlign.center;

  if (align === StrokeAlign.center) {
    const { inner, outer } = getStrokeOutlinePolygons(points, node.strokeWidth / 2, true);
    return [outer, inner];
  }

  return getAlignedStrokeBand(points, isHole, align, node.strokeWidth);
};

const getClosedPathShape = (node: TVectorNode, points: TVectorStrokePath['points'], isHole: boolean): TLineStrokeShape => {
  const midline = getAlignedStrokeMidline(points, node.strokeWidth / 2, node.strokeAlign ?? StrokeAlign.center, isHole);
  const polygons = getVectorModeStrokePolygons(node, midline);

  return { fillRule: 'evenOdd', polygons: polygons ?? getUniformClosedPathPolygons(node, points, isHole) };
};

const getOpenPathShape = (node: TVectorNode, points: TVectorStrokePath['points'], mode: TRingMode): TLineStrokeShape => {
  const ring = buildOpenPolylineStrokeRing(points, node.strokeWidth / 2);

  return (
    (ring.perimeter > 0 ? getOpenPathModeShape(node, ring, mode) : null) ?? {
      fillRule: 'nonZero',
      polygons: [getStrokeOutlinePolygons(points, node.strokeWidth / 2, false).outer],
    }
  );
};

export const getVectorPathStrokeShape = (node: TVectorNode, path: TVectorStrokePath, mode: TRingMode, isHole: boolean): TLineStrokeShape =>
  path.closed ? getClosedPathShape(node, path.points, isHole) : getOpenPathShape(node, path.points, mode);
