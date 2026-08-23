// store
import { selectNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { commitVectorShapeBuilder } from './commitVectorShapeBuilder';

export const disarmVectorShapeBuilderDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const path = canvasRefs.vectorShapeBuilderPathRef.current;

  if (path) {
    const state = store.getState();
    const absorbedNodeIds = commitVectorShapeBuilder(
      dispatch,
      selectNodes(state),
      state.design.rootOrder,
      selectVectorEditingNodeIds(state),
      canvasRefs.touchedVectorShapeBuilderFacesRef.current,
      canvasRefs.isVectorShapeBuilderSubtractRef.current,
      path,
      canvasRefs.isVectorShapeBuilderBoxModeRef.current,
    );

    if (absorbedNodeIds.length > 0) {
      canvasRefs.selectedVectorVertexIdsRef.current = [];
      canvasRefs.selectedVectorHandlesRef.current = [];
      canvasRefs.selectedVectorSegmentIdsRef.current = [];
    }

    canvasRefs.vectorShapeBuilderPathRef.current = null;
    canvasRefs.touchedVectorShapeBuilderFacesRef.current = {};
    canvasRefs.isVectorShapeBuilderBoxModeRef.current = false;
    canvasRefs.isVectorShapeBuilderSubtractRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    setClassName('add');
  }
};
