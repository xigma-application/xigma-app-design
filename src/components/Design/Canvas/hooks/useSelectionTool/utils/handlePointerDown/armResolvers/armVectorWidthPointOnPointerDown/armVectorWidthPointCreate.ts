// others
import { nanoid } from '@reduxjs/toolkit';
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { RootState } from 'store';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getVectorChainFractionAtPosition } from 'utils/canvas/vectorNetwork/getVectorChainFractionAtPosition';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { getVectorCutHitAcrossOpenNodes } from '../../../../../../utils/getVectorCutHitAcrossOpenNodes';
import { getVectorSegmentNormalAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentNormalAtT';

export const armVectorWidthPointCreate = (
  canvas: HTMLCanvasElement,
  canvasRefs: TCanvasRefs,
  event: PointerEvent,
  point: TPoint,
  setClassName: (className: string | null) => void,
  state: RootState,
  eligibleNodes: TVectorNode[],
  viewport: TViewport,
): true | undefined => {
  const strokeHit = getVectorCutHitAcrossOpenNodes(
    point,
    eligibleNodes.map((node) => node.id),
    state.design.pages[state.design.activePageId].nodes,
    VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
    VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
  );

  if (strokeHit) {
    const chainOrder = getVectorChainOrder(strokeHit.node)!;
    const position = getVectorChainFractionAtPosition(strokeHit.node, chainOrder, strokeHit.hit.segmentId, strokeHit.hit.t);
    const baseOffset = strokeHit.node.strokeWidth / 2;
    const newPointId = nanoid();
    const normal = getVectorSegmentNormalAtT(strokeHit.node, strokeHit.node.segments[strokeHit.hit.segmentId], strokeHit.hit.t);

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: baseOffset,
      armWorldPoint: point,
      groupTargets: [],
      isNewPoint: true,
      nodeId: strokeHit.node.id,
      point: { id: newPointId, leftOffset: baseOffset, position, rightOffset: baseOffset },
      target: 'right',
    };
    canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [
      { nodeId: strokeHit.node.id, pointId: newPointId, side: 'left' },
      { nodeId: strokeHit.node.id, pointId: newPointId, side: 'right' },
      { nodeId: strokeHit.node.id, pointId: newPointId, side: 'point' },
    ];
    canvasRefs.vectorEdit.lastVectorWidthHandleSideRef.current = { nodeId: strokeHit.node.id, pointId: newPointId, side: 'right' };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = getRotatedResizeCursorUrl(getAngleBetweenPoints({ x: 0, y: 0 }, normal)) ?? '';
    setClassName(null);

    return true;
  }
};
