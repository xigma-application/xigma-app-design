// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { isFreeFormFrameWithChildren } from '../../../PositionSection/ColumnAlignment/hooks/utils/isFreeFormFrameWithChildren';

export const isSpacingContainerNode = (node: TSceneNode | undefined): node is TFrameNode | TGroupNode | TSectionNode =>
  isFreeFormFrameWithChildren(node) || ((node?.type === NodeType.group || node?.type === NodeType.section) && node.childIds.length > 0);
