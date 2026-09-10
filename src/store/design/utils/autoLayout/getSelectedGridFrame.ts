// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

export const getSelectedGridFrame = (selectedNodes: TSceneNode[]): TFrameNode | null => {
  const [selectedNode] = selectedNodes;
  const isSingleGridFrame =
    selectedNodes.length === 1 && selectedNode?.type === NodeType.frame && selectedNode.layoutMode === LayoutMode.grid;

  return isSingleGridFrame ? (selectedNode as TFrameNode) : null;
};
