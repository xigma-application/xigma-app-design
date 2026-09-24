// types
import { TBoxSceneNode } from 'types/design/types';
import { TDistributeAxis } from '../../types';

export const getAxisSpan = (node: TBoxSceneNode, axis: TDistributeAxis): { size: number; start: number } =>
  axis === 'horizontal' ? { size: node.width, start: node.x } : { size: node.height, start: node.y };
