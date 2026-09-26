// others
import { LINE_VECTOR_STROKE_SETTING_KEYS } from 'utils/canvas/line/constants';

// types
import { StrokeAlign } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TRectangleNode, TStarNode, TVectorNode } from 'types/design/types';


export const getShapeVectorStrokeSettings = (node: TEllipseNode | TPolygonNode | TRectangleNode | TStarNode): Partial<TVectorNode> => {
  if ((node.strokes ?? []).length > 0 && (node.strokeWidth ?? 0) > 0) {
    return {
      ...Object.fromEntries(LINE_VECTOR_STROKE_SETTING_KEYS.filter((key) => node[key] !== undefined).map((key) => [key, node[key]])),
      strokeAlign: node.strokeAlign ?? StrokeAlign.inside,
      strokeWidth: node.strokeWidth,
      strokes: node.strokes,
    };
  }

  return {};
};
