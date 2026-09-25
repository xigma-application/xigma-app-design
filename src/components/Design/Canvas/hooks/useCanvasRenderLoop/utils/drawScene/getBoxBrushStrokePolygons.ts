// types
import { StrokeProfile } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSectionNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getBoxScatterBrushPolygons } from './getBoxScatterBrushPolygons/getBoxScatterBrushPolygons';
import { getBoxTracedBrushPolygons } from './getBoxTracedBrushPolygons';
import { getBrushShape } from 'utils/brushes/brushShapeCache';
import { getBoxStretchBrushPolygons } from './getBoxStretchBrushPolygons/getBoxStretchBrushPolygons';
import { getStrokeBrushCategory } from 'utils/design/stroke/getStrokeBrushCategory';
import { getStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';
import { memoizeBrushPolygons } from './memoizeBrushPolygons';

const getKey = (node: TFrameNode | TRectangleNode | TSectionNode, outer: TPoint[], inner: TPoint[], isTraced: boolean): string =>
  [
    isTraced,
    node.id,
    JSON.stringify(getStrokeBrushValues(node)),
    node.strokeWidth,
    node.strokeProfile,
    node.strokeProfileFlipped,
    [...outer, ...inner].map((point) => `${point.x.toFixed(3)},${point.y.toFixed(3)}`).join(';'),
  ].join('|');

export const getBoxBrushStrokePolygons = (
  node: TFrameNode | TRectangleNode | TSectionNode,
  outer: TPoint[],
  inner: TPoint[],
): TPoint[][] | null => {
  const values = getStrokeBrushValues(node);
  const category = getStrokeBrushCategory(values.brush);
  const shape = category ? getBrushShape(values.brush) : null;

  if (category) {
    return memoizeBrushPolygons(getKey(node, outer, inner, shape !== null), () => {
      const shared = {
        direction: values.direction,
        flipped: node.strokeProfileFlipped ?? false,
        index: category.index,
        profile: node.strokeProfile ?? StrokeProfile.uniform,
        seed: `${node.id}:${values.brush}`,
        strokeWidth: node.strokeWidth ?? 0,
      };

      switch (true) {
        case category.category === 'scatter':
          return getBoxScatterBrushPolygons(outer, inner, { ...shared, ...values, stats: shape?.scatter });
        case shape !== null:
          return getBoxTracedBrushPolygons(outer, inner, shared, shape?.contours ?? []);
        default:
          return getBoxStretchBrushPolygons(outer, inner, shared);
      }
    });
  }

  return null;
};
