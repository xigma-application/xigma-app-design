// types
import { BlendMode } from 'types/design/enums';
import { TMediaNode, TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isSafeAncestorChain } from '../isSafeAncestorChain';

const isOwnStyleSupported = (node: TMediaNode): boolean =>
  !node.hidden && (!node.blendMode || node.blendMode === BlendMode.normal) && Boolean(node.src);

export const canExportMediaNodeAsSvgVector = (node: TMediaNode, nodesById: Record<string, TSceneNode>): boolean =>
  isOwnStyleSupported(node) && isSafeAncestorChain(getRotatedNodeBounds(node), node.parentId, nodesById, true, true);
