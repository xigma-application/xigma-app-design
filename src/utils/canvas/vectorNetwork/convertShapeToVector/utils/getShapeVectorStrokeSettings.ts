// others
import { LINE_VECTOR_STROKE_SETTING_KEYS } from 'utils/canvas/line/constants';

// types
import { StrokeAlign } from 'types/design/enums';
import { TEllipseNode, TPolygonNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getBooleanStrokeColor } from 'utils/canvas/booleanOperation/getBooleanStrokeColor';

export const getShapeVectorStrokeSettings = (node: TEllipseNode | TPolygonNode | TRectangleNode): Partial<TVectorNode> => {
  const strokeColor = getBooleanStrokeColor(node);

  if (strokeColor && (node.strokeWidth ?? 0) > 0) {
    return {
      ...Object.fromEntries(LINE_VECTOR_STROKE_SETTING_KEYS.filter((key) => node[key] !== undefined).map((key) => [key, node[key]])),
      strokeAlign: node.strokeAlign ?? StrokeAlign.inside,
      strokeColor,
      strokeWidth: node.strokeWidth,
    };
  }

  return {};
};
