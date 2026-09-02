// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TVertexDotBufferCacheEntry } from '../drawVectorVertexDots/types';

// utils
import { drawVectorEditHandlesForNode } from '../drawVectorEditHandlesForNode/drawVectorEditHandlesForNode';
import { drawVectorMultiSelectBox } from '../drawVectorMultiSelectBox/drawVectorMultiSelectBox';
import { getBakedVectorEditingNodes } from '../getBakedVectorEditingNodes';
import { getVectorEditingNode } from '../../../../../../utils/getVectorEditingNode';

export const drawVectorEditHandlesLayer = (
  context: TDrawSceneContext,
  vertexDotBufferCache: WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  refs: TCanvasRefs,
  penActiveVertexId: string | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const selectedVertexIds = refs.vectorEdit.selectedVectorVertexIdsRef.current;
  const preMarqueeVertexIds = refs.vectorEdit.preVectorMarqueeVertexIdsRef.current;
  const selectedSegmentIds = refs.vectorEdit.selectedVectorSegmentIdsRef.current;
  const preMarqueeSegmentIds = refs.vectorEdit.preVectorMarqueeSegmentIdsRef.current;
  const hoveredVertexId = refs.hover.hoveredVectorVertexIdRef.current;
  const newVertexIds = refs.vectorCut.newVectorCutVertexIdsRef.current;
  const isMeasuring = Boolean(refs.transform.distanceGuidesRef.current);
  const hoveredSegmentId = refs.hover.hoveredSegmentIdRef.current;
  const hoveredVectorSegmentId = refs.hover.hoveredVectorSegmentIdRef.current;
  const hoveredVectorEdgeInsertPoint = refs.hover.hoveredVectorEdgeInsertPointRef.current;
  const hoveredHandle = refs.hover.hoveredVectorHandleRef.current;
  const selectedHandles = refs.vectorEdit.selectedVectorHandlesRef.current;
  const snappedHandle = refs.vectorEdit.snappedVectorHandleRef.current;
  const dragOriginVertexId = refs.pen.penDragOriginRef.current?.vertexId ?? null;
  const penDraggedHandlePosition = refs.pen.penDraggedHandlePositionRef.current;
  const isPenDraggedHandleSnapped = refs.pen.penDraggedHandleIsSnappedRef.current;
  const vectorMultiSelectBoxRef = refs.vectorMultiSelect.vectorMultiSelectBoxRef;
  const vectorMultiSelectResizeDrag = refs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current;
  const vectorMultiSelectRotateDrag = refs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current;
  const isVectorMultiDragMoving = Boolean(refs.vectorMultiSelect.vectorMultiDragRef.current?.hasMoved);
  const bakedNodes = getBakedVectorEditingNodes(nodes, vectorEditingNodeIds);

  vectorEditingNodeIds.forEach((vectorEditingNodeId) => {
    const editingNode = getVectorEditingNode(nodes, vectorEditingNodeId);

    if (editingNode) {
      drawVectorEditHandlesForNode(
        gl,
        program,
        buffer,
        vertexDotBufferCache,
        editingNode,
        selectedVertexIds,
        preMarqueeVertexIds,
        selectedSegmentIds,
        preMarqueeSegmentIds,
        hoveredVertexId,
        newVertexIds,
        isMeasuring,
        hoveredSegmentId,
        hoveredVectorSegmentId,
        hoveredVectorEdgeInsertPoint,
        hoveredHandle,
        selectedHandles,
        snappedHandle,
        penActiveVertexId,
        dragOriginVertexId,
        penDraggedHandlePosition,
        isPenDraggedHandleSnapped,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    }
  });

  drawVectorMultiSelectBox(
    gl,
    program,
    buffer,
    bakedNodes,
    vectorEditingNodeIds,
    selectedVertexIds,
    selectedSegmentIds,
    selectedHandles,
    vectorMultiSelectBoxRef,
    vectorMultiSelectResizeDrag,
    vectorMultiSelectRotateDrag,
    isVectorMultiDragMoving,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
