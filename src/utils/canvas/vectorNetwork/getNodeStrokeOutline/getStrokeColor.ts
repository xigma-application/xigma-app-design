// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

export const getStrokeColor = (node: TStrokeableNode): string => (node.type === NodeType.line ? node.stroke : (node.strokeColor ?? ''));
