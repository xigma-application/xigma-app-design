import { RefObject, useEffect, useRef } from 'react';

// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { store, useAppDispatch, useAppSelector } from 'store';

// styles
import styles from '../../canvas.module.scss';

// types
import { MouseButton } from 'types/enums';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { applyDragPan } from '../useCanvasDragPan/utils/applyDragPan';
import { getPointerPosition } from '../../utils/getPointerPosition';

const HAND_CURSOR_CLASS = styles['Canvas__canvas-element--hand'];
const PRESSING_CURSOR_CLASS = styles['Canvas__canvas-element--pressing'];

export const useHandTool = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const lastPointRef = useRef<TPoint | null>(null);

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.button === MouseButton.primary) {
      lastPointRef.current = getPointerPosition(canvas, event);
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.remove(HAND_CURSOR_CLASS);
      canvas.classList.add(PRESSING_CURSOR_CLASS);
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
      canvas.classList.remove(PRESSING_CURSOR_CLASS);
      canvas.classList.add(HAND_CURSOR_CLASS);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.hand) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event);

      canvas.classList.add(HAND_CURSOR_CLASS);
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.classList.remove(HAND_CURSOR_CLASS, PRESSING_CURSOR_CLASS);
        lastPointRef.current = null;
      };
    }
  }, [activeTool, canvasRef, dispatch]);
};
