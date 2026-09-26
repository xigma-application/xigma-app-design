// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

// utils
import { getBooleanStrokeColor } from '../../booleanOperation/getBooleanStrokeColor';

export const getStrokeColor = (node: TStrokeableNode): string => {
  switch (node.type) {
    case NodeType.ellipse:
    case NodeType.line:
    case NodeType.polygon:
    case NodeType.star:
    case NodeType.vector:
      return getBooleanStrokeColor(node) ?? '';
    default:
      return node.strokeColor ?? '';
  }
};
