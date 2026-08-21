import { useEffect, useRef } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store, useAppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { MouseButton } from 'types/enums';
import { TPoint } from 'types/canvas';

// utils
import { applyDragPan } from './utils/applyDragPan';
import { getPointerPosition } from '../../utils/getPointerPosition';

export const useCanvasDragPan = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const dispatch = useAppDispatch();
  const { setClassName } = useClassNames();
  const lastPointRef = useRef<TPoint | null>(null);

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.button === MouseButton.middle) {
      event.preventDefault();
      lastPointRef.current = getPointerPosition(canvas, event);
      canvas.setPointerCapture(event.pointerId);
      setClassName('pressing');
    }
  };

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (lastPointRef.current) {
      const point = getPointerPosition(canvas, event);
      const viewport = selectViewport(store.getState());

      dispatch(setViewport(applyDragPan(viewport, point.x - lastPointRef.current.x, point.y - lastPointRef.current.y)));
      lastPointRef.current = point;
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (lastPointRef.current) {
      lastPointRef.current = null;
      canvas.releasePointerCapture(event.pointerId);
      setClassName(null);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
      };
    }
  }, [canvasRef, dispatch]);
};
