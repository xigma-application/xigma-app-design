// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// a pointerdown that hits nothing while Vector Edit Mode is active deselects the current vertex instead
// of falling through to armMarqueeOnPointerDown, whose immediate setSelection([]) would otherwise clear
// vectorEditingNodeId (via handleSetSelection.ts) and exit the mode on every stray miss-click — exiting by
// click alone is reserved for a deliberate double-click on empty space (useVectorEditOnDoubleClick.ts)
export const armVectorEditMissOnPointerDown = ({ canvasRefs, hit }: TArmContext): true | undefined => {
  const vectorEditingNodeId = selectVectorEditingNodeId(store.getState());

  if (vectorEditingNodeId && !hit) {
    canvasRefs.selectedVectorVertexIdsRef.current = [];

    return true;
  }
};
