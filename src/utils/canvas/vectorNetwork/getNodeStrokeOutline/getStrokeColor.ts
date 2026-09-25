// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

// utils
import { getBooleanStrokeColor } from '../../booleanOperation/getBooleanStrokeColor';

export const getStrokeColor = (node: TStrokeableNode): string =>
  node.type === NodeType.line ? (getBooleanStrokeColor(node) ?? '') : (node.strokeColor ?? '');
