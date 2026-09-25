// types
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { canExportLineStroke } from '../canExportLineStroke';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isSafeAncestorChain } from '../isSafeAncestorChain';

export const canExportLineAsSvgVector = (node: TLineNode, nodesById: Record<string, TSceneNode>): boolean =>
  !node.hidden && canExportLineStroke(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true, true);
