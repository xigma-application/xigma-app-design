// types
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorStrokeFillShape } from './getVectorStrokeFillShape';
import { getVisibleStrokePaints } from './getVisibleStrokePaints';

const getShapeFacePolygons = (shape: TLineStrokeShape): TPoint[][][] =>
  shape.fillRule === 'nonZero' ? shape.polygons.map((polygon) => [polygon]) : [shape.polygons];

export const getVectorStrokeShapeFaces = (node: TVectorNode): { paint: TPaint[]; points: TPoint[][] }[] =>
  (getVectorStrokeFillShape(node) ?? [])
    .flatMap(getShapeFacePolygons)
    .map((points) => ({ paint: getVisibleStrokePaints(node.strokes), points }));
