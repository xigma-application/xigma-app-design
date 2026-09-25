// types
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TPaint } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorStrokeShape } from './getVectorStrokeShape';

const getShapeFacePolygons = (shape: TLineStrokeShape): TPoint[][][] =>
  shape.fillRule === 'nonZero' ? shape.polygons.map((polygon) => [polygon]) : [shape.polygons];

export const getVectorStrokeShapeFaces = (node: TVectorNode): { paint: TPaint[]; points: TPoint[][] }[] =>
  (getVectorStrokeShape(node) ?? [])
    .flatMap(getShapeFacePolygons)
    .map((points) => ({ paint: [{ color: node.strokeColor, opacity: 100, type: 'solid' }], points }));
