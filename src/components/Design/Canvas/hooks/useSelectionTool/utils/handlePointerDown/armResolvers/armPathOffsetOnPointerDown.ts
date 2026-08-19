// types
import { TArmContext } from '../types';

// utils
import { armPathOffsetDrag } from '../armPathOffsetDrag';
import { getPathTextOffsetHandleAtPoint } from '../../../../../utils/getPathTextOffsetHandleAtPoint';

export const armPathOffsetOnPointerDown = ({
  canvas,
  event,
  point,
  selectedNodes,
  selectionRefs,
  setClassName,
  viewport,
}: TArmContext): true | undefined => {
  const pathOffsetHandleHit = getPathTextOffsetHandleAtPoint(point, selectedNodes, viewport);

  if (pathOffsetHandleHit) {
    armPathOffsetDrag(canvas, event, selectionRefs.pathOffsetDragRef, pathOffsetHandleHit.nodeId, setClassName);

    return true;
  }
};
