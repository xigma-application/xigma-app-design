// others
import { DEFAULT_VECTOR_PAINT } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TBooleanNode, TSceneNode } from 'types/design/types';

// utils
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';

export type TNodePaintStyle = Pick<TBooleanNode, 'effects' | 'fills' | 'strokeAlign' | 'strokeWidth' | 'strokes'>;

export const getNodePaintStyle = (node: TSceneNode | undefined): TNodePaintStyle => {
  switch (node?.type) {
    case NodeType.boolean:
    case NodeType.rectangle:
    case NodeType.section:
      return {
        effects: node.effects,
        fills: node.fills,
        strokeAlign: node.strokeAlign,
        strokeWidth: node.strokeWidth,
        strokes: node.strokes,
      };
    case NodeType.ellipse:
      return {
        fills: [makeSolidPaint(node.fill)],
        strokeWidth: node.strokeWidth,
        strokes: node.strokeColor ? [makeSolidPaint(node.strokeColor)] : undefined,
      };
    case NodeType.polygon:
    case NodeType.star:
    case NodeType.text:
      return { fills: [makeSolidPaint(node.fill)] };
    case NodeType.vector:
      return {
        fills: node.defaultFill ?? [DEFAULT_VECTOR_PAINT],
        strokeWidth: node.strokeWidth,
        strokes: node.strokeWidth > 0 ? [makeSolidPaint(node.strokeColor)] : undefined,
      };
    case NodeType.line:
      return { fills: [DEFAULT_VECTOR_PAINT], strokeWidth: node.strokeWidth, strokes: [makeSolidPaint(node.stroke)] };
    default:
      return { fills: [DEFAULT_VECTOR_PAINT] };
  }
};
