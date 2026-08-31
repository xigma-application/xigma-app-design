// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getVectorChainFractionAtPosition } from 'utils/canvas/vectorNetwork/getVectorChainFractionAtPosition';
import { getVectorChainOrder } from 'utils/canvas/vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { getVectorChainPositionAtFraction } from 'utils/canvas/vectorNetwork/getVectorChainPositionAtFraction';
import { getVectorCutHitAtPoint } from '../../../../utils/getVectorCutHitAtPoint';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorSegmentNormalAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentNormalAtT';
import { getVectorSegmentPointAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentPointAtT';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueVectorWidthPointDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const drag = canvasRefs.vectorWidth.vectorWidthPointDragRef.current;

  if (drag) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.pages[state.design.activePageId].nodes, drag.nodeId);
    const chainOrder = node && getVectorChainOrder(node);

    if (node && chainOrder) {
      const viewport = selectViewport(state);
      const worldPoint = screenToWorld(getPointerPosition(canvas, event), viewport);

      if (!drag.isNewPoint && drag.target === 'point') {
        const hit = getVectorCutHitAtPoint(worldPoint, node, Number.POSITIVE_INFINITY, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom)!;

        drag.point.position = getVectorChainFractionAtPosition(node, chainOrder, hit.segmentId, hit.t);
        canvas.style.cursor = '';
        setClassName('controller');
      } else {
        const { segmentId, t } = getVectorChainPositionAtFraction(node, chainOrder, drag.point.position);
        const segment = node.segments[segmentId];
        const anchor = getVectorSegmentPointAtT(node, segment, t);
        const normal = getVectorSegmentNormalAtT(node, segment, t);
        const currentSignedDistance = (worldPoint.x - anchor.x) * normal.x + (worldPoint.y - anchor.y) * normal.y;
        const armSignedDistance = (drag.armWorldPoint.x - anchor.x) * normal.x + (drag.armWorldPoint.y - anchor.y) * normal.y;
        const sideSign = drag.target === 'right' ? -1 : 1;
        const delta = drag.isNewPoint
          ? Math.abs(currentSignedDistance) - Math.abs(armSignedDistance)
          : (currentSignedDistance - armSignedDistance) * sideSign;
        const distance = Math.max(0, drag.armMagnitude + delta);

        drag.point.leftOffset = distance;
        drag.point.rightOffset = distance;
        drag.groupTargets.forEach((target) => {
          target.point.leftOffset = distance;
          target.point.rightOffset = distance;
        });
        canvas.style.cursor = getRotatedCursorUrl('resize', getAngleBetweenPoints({ x: 0, y: 0 }, normal)) ?? canvas.style.cursor;
        setClassName(null);
      }
    } else {
      setClassName('controller');
    }
  }
};
