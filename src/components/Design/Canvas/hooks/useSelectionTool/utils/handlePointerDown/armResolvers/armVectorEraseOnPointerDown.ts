// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

// utils
import { eraseVectorNetworkStep } from '../../eraseVectorNetworkStep';

export const armVectorEraseOnPointerDown = ({
  activeTool,
  canvas,
  canvasRefs,
  dispatch,
  event,
  point,
  selectionRefs,
  setClassName,
  viewport,
}: TArmContext): true | undefined => {
  const vectorEditingNodeIds = selectVectorEditingNodeIds(store.getState());

  if (activeTool === ToolName.erase && vectorEditingNodeIds.length > 0) {
    const radius = canvasRefs.eraserDiameterRef.current / 2 / viewport.zoom;

    selectionRefs.vectorEraseDragRef.current = { lastPoint: point };
    canvas.setPointerCapture(event.pointerId);
    setClassName('erase');
    eraseVectorNetworkStep(dispatch, point, point, radius);

    return true;
  }
};
