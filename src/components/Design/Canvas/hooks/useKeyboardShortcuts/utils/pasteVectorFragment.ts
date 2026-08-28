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
import { TVectorFragment } from '../types';

// utils
import { mergeClonedVectorFragment } from './mergeClonedVectorFragment';

export const pasteVectorFragment = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  fragment: TVectorFragment,
): void => {
  const targetNodeId = vectorEditingNodeIds[vectorEditingNodeIds.length - 1];
  const targetNode = nodes[targetNodeId] as TVectorNode;
  const merged = mergeClonedVectorFragment(targetNode, fragment, DUPLICATE_OFFSET, DUPLICATE_OFFSET);

  dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
  dispatch(updateNode({ changes: merged.changes, id: targetNodeId }));
  dispatch(endHistoryGesture());

  refs.vectorEdit.selectedVectorHandlesRef.current = [];
  refs.vectorEdit.selectedVectorSegmentIdsRef.current = merged.newSegmentIds;
  refs.vectorEdit.selectedVectorVertexIdsRef.current = merged.newVertexIds;
};
