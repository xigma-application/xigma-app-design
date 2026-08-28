// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { AppDispatch } from 'store';

// types
import { TSceneNode, TVectorNode } from 'types/design/types';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { duplicateOwningNodeFragments } from './duplicateOwningNodeFragments';
import { getOwningSegmentNodes } from '../handleDeleteSelection/getOwningSegmentNodes';
import { getOwningVertexNodes } from '../handleDeleteSelection/getOwningVertexNodes';

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
  dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));

  const { newSegmentIds, newVertexIds } = duplicateOwningNodeFragments(dispatch, owningNodesById, selectedVertexIds, selectedSegmentIds);
  dispatch(endHistoryGesture());

  refs.vectorEdit.selectedVectorHandlesRef.current = [];
  refs.vectorEdit.selectedVectorSegmentIdsRef.current = newSegmentIds;
  refs.vectorEdit.selectedVectorVertexIdsRef.current = newVertexIds;
};
