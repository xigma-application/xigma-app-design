// types
import { TArmContext } from '../types';

// utils
import { armLineEndpointDrag } from '../armLineEndpointDrag';
import { getLineEndpointAtPoint } from '../../../../../utils/getLineEndpointAtPoint';

export const armLineEndpointOnPointerDown = ({
  canvas,
  event,
  point,
  selectedNodes,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const lineEndpointHit = getLineEndpointAtPoint(point, selectedNodes, viewport);

  if (lineEndpointHit && !event.shiftKey) {
    armLineEndpointDrag(canvas, event, selectionRefs.endpointDragRef, lineEndpointHit.nodeId, lineEndpointHit.endpoint);

    return true;
  }
};
