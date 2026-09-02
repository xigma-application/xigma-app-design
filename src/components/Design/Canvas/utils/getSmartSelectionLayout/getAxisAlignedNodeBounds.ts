// types
import { TSceneNode } from 'types/design/types';
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getRotatedNodeBounds } from '../getRotatedNodeBounds';

export const getAxisAlignedNodeBounds = (nodes: TSceneNode[]): TSmartSelectionNode[] =>
  nodes.map((node) => ({ bounds: getRotatedNodeBounds(node), id: node.id }));
