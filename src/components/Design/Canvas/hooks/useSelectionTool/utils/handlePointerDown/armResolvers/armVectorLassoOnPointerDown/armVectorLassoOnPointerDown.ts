// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';
import { ToolName } from 'types/design/enums';

// utils
import { hitsCurrentVectorSelection } from './hitsCurrentVectorSelection';

export const armVectorLassoOnPointerDown = (context: TArmContext): true | undefined => {
  const { activeTool, canvas, canvasRefs, event, point, setClassName } = context;
  const vectorEditingNodeIds = selectVectorEditingNodeIds(store.getState());

  if (activeTool === ToolName.lasso && vectorEditingNodeIds.length > 0 && !hitsCurrentVectorSelection(context, vectorEditingNodeIds)) {
    canvasRefs.selectedVectorVertexIdsRef.current = [];
    canvasRefs.selectedVectorHandlesRef.current = [];
    canvasRefs.selectedVectorSegmentIdsRef.current = [];
    canvasRefs.vectorLassoPathRef.current = [point];
    setClassName('lasso');
    canvas.setPointerCapture(event.pointerId);

    return true;
  }
};
