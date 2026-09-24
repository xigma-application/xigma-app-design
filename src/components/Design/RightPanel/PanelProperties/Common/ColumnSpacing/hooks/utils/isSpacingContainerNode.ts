// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TGroupNode, TSceneNode } from 'types/design/types';

// utils
import { isFreeFormFrameWithChildren } from '../../../PositionSection/ColumnAlignment/hooks/utils/isFreeFormFrameWithChildren';

export const isSpacingContainerNode = (node: TSceneNode | undefined): node is TFrameNode | TGroupNode =>
  isFreeFormFrameWithChildren(node) || (node?.type === NodeType.group && node.childIds.length > 0);
