// store
import { selectNodes, selectOffsetVector } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armSimpleDrag } from '../armSimpleDrag';
import { getOffsetVectorEdgeAtPoint } from 'utils/canvas/offsetVector/getOffsetVectorEdgeAtPoint';
import { isOffsetVectorNode } from 'utils/canvas/offsetVector/isOffsetVectorNode';

export const armOffsetVectorOnPointerDown = ({ canvas, canvasRefs, event, point, viewport }: TArmContext): true | undefined => {
  const state = store.getState();
  const offsetVector = selectOffsetVector(state);
  const node = offsetVector ? selectNodes(state)[offsetVector.nodeId] : undefined;

  if (offsetVector && isOffsetVectorNode(node)) {
    const hit = getOffsetVectorEdgeAtPoint(point, node, offsetVector, viewport);

    if (hit) {
      armSimpleDrag(canvas, event, canvasRefs.offsetVector.offsetVectorDragRef, {
        angle: hit.angle,
        normal: hit.normal,
        point: hit.point,
        startDistance: offsetVector.distance,
        startPoint: point,
      });
    }

    return true;
  }
};
