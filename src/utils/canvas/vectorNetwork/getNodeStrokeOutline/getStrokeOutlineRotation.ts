// types
import { NodeType } from 'types/design/enums';
import { TStrokeableNode } from './types';

export const getStrokeOutlineRotation = (node: TStrokeableNode): number => (node.type === NodeType.line ? 0 : node.rotation);
