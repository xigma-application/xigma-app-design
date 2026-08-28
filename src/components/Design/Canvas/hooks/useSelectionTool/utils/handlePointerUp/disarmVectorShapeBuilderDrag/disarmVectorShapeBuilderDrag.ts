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
  const path = canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current;

  if (path) {
    const state = store.getState();
    const absorbedNodeIds = commitVectorShapeBuilder(
      dispatch,
      selectNodes(state),
      state.design.pages[state.design.activePageId].rootOrder,
      selectVectorEditingNodeIds(state),
      canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current,
      canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current,
      path,
      canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current,
    );

    if (absorbedNodeIds.length > 0) {
      canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
      canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [];
      canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
    }

    canvasRefs.shapeBuilder.vectorShapeBuilderPathRef.current = null;
    canvasRefs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current = {};
    canvasRefs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current = false;
    canvasRefs.shapeBuilder.isVectorShapeBuilderSubtractRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    setClassName('add');
  }
};
