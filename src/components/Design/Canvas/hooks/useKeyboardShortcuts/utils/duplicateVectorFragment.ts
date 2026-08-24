// components
import { DUPLICATE_OFFSET } from 'components/Design/Canvas/constants';

// store
import { updateNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { AppDispatch } from 'store';

// types
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { extractVectorFragment } from './extractVectorFragment';
import { getOwningSegmentNodes } from './handleDeleteSelection/getOwningSegmentNodes';
import { getOwningVertexNodes } from './handleDeleteSelection/getOwningVertexNodes';
import { mergeClonedVectorFragment } from './mergeClonedVectorFragment';

export const duplicateVectorFragment = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedSegmentIds: string[],
): void => {
  const owningNodesById = new Map<string, TVectorNode>();

  getOwningVertexNodes(vectorEditingNodeIds, nodes, selectedVertexIds).forEach((node) => owningNodesById.set(node.id, node));
  getOwningSegmentNodes(vectorEditingNodeIds, nodes, selectedSegmentIds).forEach((node) => owningNodesById.set(node.id, node));

  const newVertexIds: string[] = [];
  const newSegmentIds: string[] = [];

  dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));

  owningNodesById.forEach((node) => {
    const fragment = extractVectorFragment(
      node,
      selectedVertexIds.filter((id) => id in node.vertices),
      selectedSegmentIds.filter((id) => id in node.segments),
    );
    const merged = mergeClonedVectorFragment(node, fragment, DUPLICATE_OFFSET, DUPLICATE_OFFSET);

    dispatch(updateNode({ changes: merged.changes, id: node.id }));
    newVertexIds.push(...merged.newVertexIds);
    newSegmentIds.push(...merged.newSegmentIds);
  });

  dispatch(endHistoryGesture());

  refs.selectedVectorHandlesRef.current = [];
  refs.selectedVectorSegmentIdsRef.current = newSegmentIds;
  refs.selectedVectorVertexIdsRef.current = newVertexIds;
};
