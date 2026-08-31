// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

export const isStrokeableNode = (node: { type: NodeType }): node is TStrokeableNode =>
  node.type === NodeType.ellipse || node.type === NodeType.line || node.type === NodeType.rectangle || node.type === NodeType.vector;
