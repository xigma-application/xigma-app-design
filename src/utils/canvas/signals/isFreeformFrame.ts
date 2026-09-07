// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const isFreeformFrame = (node: TSceneNode): node is TFrameNode =>
  node.type === NodeType.frame && (node.layoutMode === undefined || node.layoutMode === LayoutMode.freeForm);
