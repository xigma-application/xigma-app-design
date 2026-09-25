// types
import { NodeType } from 'types/design/enums';
import { TCountNode } from '../types';

export const getShapeCount = (node: TCountNode): number => (node.type === NodeType.star ? node.points : node.sides);
