// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const getSelectedAutoLayoutFrame = (selectedNodes: TSceneNode[]): TFrameNode | null => {
  const [selectedNode] = selectedNodes;
  const isSingleAutoLayoutFrame =
    selectedNodes.length === 1 &&
    selectedNode?.type === NodeType.frame &&
    (selectedNode.layoutMode === LayoutMode.horizontal || selectedNode.layoutMode === LayoutMode.vertical);

  return isSingleAutoLayoutFrame ? (selectedNode as TFrameNode) : null;
};
