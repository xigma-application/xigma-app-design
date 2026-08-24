import { useEffect, useRef } from 'react';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TPencilAxis } from './utils/handlePointerMove/getAxisLockedPoint';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useDrawPencilTool = (refs: TCanvasRefs): void => {
  const { canvasRef, pencilPreviewPointsRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const committedPointsRef = useRef<TPoint[] | null>(null);
  const tailPointsRef = useRef<TPoint[] | null>(null);
  const axisLockRef = useRef<TPencilAxis | null>(null);
  const shiftAnchorRef = useRef<TPoint | null>(null);
  const rawPointsRef = useRef<TPoint[] | null>(null);
  const lastPointerClientPositionRef = useRef<TPoint | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
    handlePointerDown(
      canvas,
      event,
      dispatch,
      appStore,
      refs,
      committedPointsRef,
      tailPointsRef,
      axisLockRef,
      shiftAnchorRef,
      rawPointsRef,
    );
  };

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
    handlePointerMove(canvas, event, appStore, refs, committedPointsRef, tailPointsRef, axisLockRef, shiftAnchorRef, rawPointsRef);
  };

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    handlePointerUp(canvas, event, dispatch, appStore, refs, committedPointsRef, tailPointsRef, axisLockRef, shiftAnchorRef, rawPointsRef);
  };

  const onModifierKeyChange = (canvas: HTMLCanvasElement, event: KeyboardEvent): void => {
    if ((event.key === 'Shift' || event.key === 'Control' || event.key === 'Meta') && lastPointerClientPositionRef.current) {
      const { x, y } = lastPointerClientPositionRef.current;

      onPointerMove(
        canvas,
        new PointerEvent('pointermove', {
          clientX: x,
          clientY: y,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          pointerId: -1,
          shiftKey: event.shiftKey,
        }),
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.pencil) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);
      const pointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event);
      const modifierKeyDownListener = (event: KeyboardEvent): void => onModifierKeyChange(canvas, event);
      const modifierKeyUpListener = (event: KeyboardEvent): void => onModifierKeyChange(canvas, event);

      canvas.addEventListener('pointerdown', pointerDownListener);
      canvas.addEventListener('pointermove', pointerMoveListener);
      canvas.addEventListener('pointerup', pointerUpListener);
      window.addEventListener('keydown', modifierKeyDownListener);
      window.addEventListener('keyup', modifierKeyUpListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', pointerDownListener);
        canvas.removeEventListener('pointermove', pointerMoveListener);
        canvas.removeEventListener('pointerup', pointerUpListener);
        window.removeEventListener('keydown', modifierKeyDownListener);
        window.removeEventListener('keyup', modifierKeyUpListener);
        committedPointsRef.current = null;
        tailPointsRef.current = null;
        axisLockRef.current = null;
        shiftAnchorRef.current = null;
        rawPointsRef.current = null;
        lastPointerClientPositionRef.current = null;
        pencilPreviewPointsRef.current = null;
        refs.pencilRawPreviewPointsRef.current = null;
        refs.pencilShowRawPreviewRef.current = false;
      };
    }
  }, [activeTool, appStore, canvasRef, dispatch, pencilPreviewPointsRef, refs]);
};
