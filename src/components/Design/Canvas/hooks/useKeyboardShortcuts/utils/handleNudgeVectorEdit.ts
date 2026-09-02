// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorTangent } from 'types/design/types';

// utils
import { findVectorEditingNodeForSegment } from 'components/Design/Canvas/utils/findVectorEditingNodeForSegment';
import { getMirroredVectorSegments } from 'components/Design/Canvas/utils/getMirroredVectorSegments';
import { getOwningVertexNodes } from './handleDeleteSelection/getOwningVertexNodes';
import { translateVectorVertices } from 'components/Design/Canvas/utils/translateVectorVertices';
import { updateNudgeVectorDistanceGuide } from './updateNudgeVectorDistanceGuide';

const nudgeSelectedVertices = (dispatch: AppDispatch, refs: TCanvasRefs, deltaX: number, deltaY: number): void => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const { nodes } = state.design.pages[state.design.activePageId];
  const selectedVertexIds = refs.vectorEdit.selectedVectorVertexIdsRef.current;
  const owningNodes = getOwningVertexNodes(vectorEditingNodeIds, nodes, selectedVertexIds);

  owningNodes.forEach((node) => {
    const origins = Object.fromEntries(selectedVertexIds.filter((id) => node.vertices[id]).map((id) => [id, node.vertices[id]]));

    dispatch(
      updateNode({
        changes: { vertices: { ...node.vertices, ...translateVectorVertices(origins, deltaX, deltaY) } },
        id: node.id,
      }),
    );
  });
};

const nudgeSelectedHandles = (dispatch: AppDispatch, refs: TCanvasRefs, deltaX: number, deltaY: number): void => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const { nodes } = state.design.pages[state.design.activePageId];

  refs.vectorEdit.selectedVectorHandlesRef.current.forEach(({ end, segmentId }) => {
    const node = findVectorEditingNodeForSegment(vectorEditingNodeIds, nodes, segmentId);
    const segment = node?.segments[segmentId];
    const field = end === 'start' ? 'tangentStart' : 'tangentEnd';
    const currentTangent = segment?.[field];

    if (node && segment && currentTangent) {
      const vertexId = end === 'start' ? segment.startId : segment.endId;
      const tangent: TVectorTangent = { x: Math.round(currentTangent.x + deltaX), y: Math.round(currentTangent.y + deltaY) };
      const mode = node.vertexHandleModes[vertexId] ?? 'corner';
      const segments = getMirroredVectorSegments(node.segments, vertexId, mode, segmentId, field, tangent);

      dispatch(updateNode({ changes: { segments }, id: node.id }));
    }
  });
};

export const handleNudgeVectorEdit = (dispatch: AppDispatch, refs: TCanvasRefs, deltaX: number, deltaY: number, altKey: boolean): void => {
  const { selectedVectorHandlesRef, selectedVectorVertexIdsRef } = refs.vectorEdit;
  const hasSelectedVertices = selectedVectorVertexIdsRef.current.length > 0;
  const hasSelectedHandles = selectedVectorHandlesRef.current.length > 0;

  if (hasSelectedVertices || hasSelectedHandles) {
    dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));

    if (hasSelectedVertices) {
      nudgeSelectedVertices(dispatch, refs, deltaX, deltaY);
    } else {
      nudgeSelectedHandles(dispatch, refs, deltaX, deltaY);
    }

    // the cached multi-select box (getVectorMultiSelectBox.ts) only recomputes when the set of
    // selected ids changes, not their positions — a mouse drag keeps it in sync by translating it
    // live (continueVectorMultiDrag.ts), but a keyboard nudge commits straight to the store with no
    // such in-progress drag state, so the stale cached box has to be dropped here instead, forcing a
    // fresh recompute against the just-nudged positions on the next render
    refs.vectorMultiSelect.vectorMultiSelectBoxRef.current = null;

    dispatch(endHistoryGesture());
    updateNudgeVectorDistanceGuide(store.getState(), refs, altKey);
  }
};
