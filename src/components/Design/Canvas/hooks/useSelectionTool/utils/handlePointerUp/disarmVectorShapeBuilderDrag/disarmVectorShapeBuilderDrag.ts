// store
import { selectNodes } from 'store/design/selectors';
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
  if (canvasRefs.vectorShapeBuilderPathRef.current) {
    commitVectorShapeBuilder(
      dispatch,
      selectNodes(store.getState()),
      canvasRefs.touchedVectorShapeBuilderFacesRef.current,
      canvasRefs.isVectorShapeBuilderSubtractRef.current,
    );

    canvasRefs.vectorShapeBuilderPathRef.current = null;
    canvasRefs.touchedVectorShapeBuilderFacesRef.current = {};
    canvasRefs.isVectorShapeBuilderBoxModeRef.current = false;
    canvasRefs.isVectorShapeBuilderSubtractRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    setClassName('add');
  }
};
