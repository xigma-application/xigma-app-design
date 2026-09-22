// types
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isSafeAncestorChain } from './isSafeAncestorChain';

export const canExportLineAsVector = (node: TLineNode, nodesById: Record<string, TSceneNode>): boolean =>
  !node.hidden && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true);
