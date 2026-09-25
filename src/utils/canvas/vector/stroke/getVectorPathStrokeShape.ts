// types
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TRingMode } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/types';
import { TVectorNode } from 'types/design/types';
import { TVectorStrokePath } from './types';

// utils
import { buildOpenPolylineStrokeRing } from './buildOpenPolylineStrokeRing';
import { getOpenPathModeShape } from './getOpenPathModeShape';
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';
import { getVectorModeStrokePolygons } from './getVectorModeStrokePolygons';

const getClosedPathShape = (node: TVectorNode, points: TVectorStrokePath['points']): TLineStrokeShape => {
  const polygons = getVectorModeStrokePolygons(node, points);
  const { inner, outer } = getStrokeOutlinePolygons(points, node.strokeWidth / 2, true);

  return { fillRule: 'evenOdd', polygons: polygons ?? [outer, inner] };
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

export const getVectorPathStrokeShape = (node: TVectorNode, path: TVectorStrokePath, mode: TRingMode): TLineStrokeShape =>
  path.closed ? getClosedPathShape(node, path.points) : getOpenPathShape(node, path.points, mode);
