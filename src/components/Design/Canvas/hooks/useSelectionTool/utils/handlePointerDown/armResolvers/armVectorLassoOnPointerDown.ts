// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { ToolName } from 'types/design/enums';

export const armVectorLassoOnPointerDown = ({
  activeTool,
  canvas,
  canvasRefs,
  event,
  point,
  setClassName,
}: TArmContext): true | undefined => {
  const vectorEditingNodeId = selectVectorEditingNodeId(store.getState());

  if (activeTool === ToolName.lasso && vectorEditingNodeId) {
    canvasRefs.selectedVectorVertexIdsRef.current = [];
    canvasRefs.selectedVectorHandlesRef.current = [];
    canvasRefs.selectedVectorSegmentIdsRef.current = [];
    canvasRefs.vectorLassoPathRef.current = [point];
    setClassName('lasso');
    canvas.setPointerCapture(event.pointerId);

    return true;
  }
};
