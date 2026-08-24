// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { extractVectorFragment } from './extractVectorFragment';
import { getOwningSegmentNodes } from './handleDeleteSelection/getOwningSegmentNodes';
import { getOwningVertexNodes } from './handleDeleteSelection/getOwningVertexNodes';
import { setVectorClipboardFragment } from './vectorClipboard';

export const copyVectorFragment = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedSegmentIds: string[],
): void => {
  const owningNodesById = new Map<string, TVectorNode>();

  getOwningVertexNodes(vectorEditingNodeIds, nodes, selectedVertexIds).forEach((node) => owningNodesById.set(node.id, node));
  getOwningSegmentNodes(vectorEditingNodeIds, nodes, selectedSegmentIds).forEach((node) => owningNodesById.set(node.id, node));

  const fragments = Array.from(owningNodesById.values()).map((node) =>
    extractVectorFragment(
      node,
      selectedVertexIds.filter((id) => id in node.vertices),
      selectedSegmentIds.filter((id) => id in node.segments),
    ),
  );

  setVectorClipboardFragment({
    filledFacePieceKeySets: fragments.flatMap((fragment) => fragment.filledFacePieceKeySets),
    segments: fragments.flatMap((fragment) => fragment.segments),
    vertexHandleModes: Object.fromEntries(fragments.flatMap((fragment) => Object.entries(fragment.vertexHandleModes))),
    vertices: fragments.flatMap((fragment) => fragment.vertices),
  });
};
