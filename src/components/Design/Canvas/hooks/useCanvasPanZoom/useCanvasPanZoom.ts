import { useEffect } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store, useAppDispatch } from 'store';

// utils
import { applyPan } from './utils/applyPan';
import { applyZoom } from './utils/applyZoom';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { isControlPressed } from 'utils/isControlPressed';

export const useCanvasPanZoom = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const dispatch = useAppDispatch();

  const handleWheel = (canvas: HTMLCanvasElement, event: WheelEvent): void => {
    event.preventDefault();
    const viewport = selectViewport(store.getState());

    if (isControlPressed(event)) {
      dispatch(setViewport(applyZoom(viewport, event.deltaY, getPointerPosition(canvas, event))));
    } else {
      dispatch(setViewport(applyPan(viewport, event.deltaX, event.deltaY)));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const onWheel = (event: WheelEvent): void => handleWheel(canvas, event);
      canvas.addEventListener('wheel', onWheel, { passive: false });

      return (): void => {
        canvas.removeEventListener('wheel', onWheel);
      };
    }
  }, [canvasRef, dispatch]);
};
