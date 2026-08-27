// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

export const armVectorEraseOnPointerDown = ({
  activeTool,
  canvas,
  canvasRefs,
  event,
  point,
  selectionRefs,
  setClassName,
}: TArmContext): true | undefined => {
  const vectorEditingNodeIds = selectVectorEditingNodeIds(store.getState());

  if (activeTool === ToolName.erase && vectorEditingNodeIds.length > 0) {
    selectionRefs.vectorEraseDragRef.current = { lastPoint: point };
    canvasRefs.vectorEraseStrokeRef.current = [point];
    canvas.setPointerCapture(event.pointerId);
    setClassName('erase');

    return true;
  }
};
