import { useEffect, useRef } from 'react';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// hooks
import { usePencilDragRefs } from './hooks/usePencilDragRefs/usePencilDragRefs';

// utils
import { handleKeyChange } from './utils/handleKeyChange/handleKeyChange';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useDrawPencilTool = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const { pencilPreviewPointsRef } = refs.pencil;
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const pencilDragRefs = usePencilDragRefs();
  const lastPointerClientPositionRef = useRef<TPoint | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
    handlePointerDown(canvas, event, dispatch, appStore, refs, pencilDragRefs);
  };

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
    handlePointerMove(canvas, event, appStore, refs, pencilDragRefs);
  };

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    handlePointerUp(canvas, event, dispatch, appStore, refs, pencilDragRefs);
  };

  const onModifierKeyChange = (canvas: HTMLCanvasElement, event: KeyboardEvent): void => {
    handleKeyChange(canvas, event, onPointerMove, lastPointerClientPositionRef.current);
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
        pencilDragRefs.committedPointsRef.current = null;
        pencilDragRefs.tailPointsRef.current = null;
        pencilDragRefs.axisLockRef.current = null;
        pencilDragRefs.shiftAnchorRef.current = null;
        pencilDragRefs.rawPointsRef.current = null;
        lastPointerClientPositionRef.current = null;
        pencilPreviewPointsRef.current = null;
        refs.pencil.pencilRawPreviewPointsRef.current = null;
        refs.pencil.pencilShowRawPreviewRef.current = false;
      };
    }
  }, [activeTool, appStore, canvasRef, dispatch, pencilDragRefs, pencilPreviewPointsRef, refs]);
};
