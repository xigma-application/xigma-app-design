import { RefObject } from 'react';

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppStore } from 'store';

// types
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { resolvePenTargetNode } from '../resolvePenTargetNode';
import { updateActiveVertexPreview } from './updateActiveVertexPreview';
import { updateNoActiveVertexPreview } from './updateNoActiveVertexPreview';

export const updatePenPreview = (
  point: TPoint,
  viewport: TViewport,
  isShiftPressed: boolean,
  appStore: AppStore,
  penPreviewRef: TPenRefs['penPreviewRef'],
  penNewVertexPreviewRef: TPenRefs['penNewVertexPreviewRef'],
  penDraggedHandlePositionRef: TPenRefs['penDraggedHandlePositionRef'],
  penDraggedHandleIsSnappedRef: TPenRefs['penDraggedHandleIsSnappedRef'],
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  hoveredSegmentIdRef: THoverRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TPenRefs['penHoveredDragArmableVertexRef'],
  vectorAlignmentGuideRef: TVectorEditRefs['vectorAlignmentGuideRef'],
  setClassName: (className: string | null) => void,
): void => {
  const state = appStore.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const penActiveVertexId = selectPenActiveVertexId(state);
  const node = resolvePenTargetNode(
    point,
    vectorEditingNodeIds,
    state.design.nodes,
    penActiveVertexId,
    VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    viewport.zoom,
  );

  penDraggedHandlePositionRef.current = null;
  penDraggedHandleIsSnappedRef.current = false;

  if (node && penActiveVertexId) {
    updateActiveVertexPreview(
      point,
      node,
      state.design.nodes,
      penActiveVertexId,
      viewport,
      isShiftPressed,
      penPreviewRef,
      pendingOutgoingTangentRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      vectorAlignmentGuideRef,
      vectorEditingNodeIds.filter((id) => id !== node.id),
      penNewVertexPreviewRef,
      setClassName,
    );
  } else {
    updateNoActiveVertexPreview(
      point,
      node,
      viewport,
      penNewVertexPreviewRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      penPreviewRef,
      vectorAlignmentGuideRef,
      setClassName,
    );
  }
};
