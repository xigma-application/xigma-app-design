import { useEffect, useRef } from 'react';

// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TLineEndpointStyle } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';
import { handleShiftKeyChange } from './utils/handleShiftKeyChange/handleShiftKeyChange';

export type TLineToolConfig = {
  endPoint: TLineEndpointStyle;
  name: string;
  startPoint: TLineEndpointStyle;
  stroke: string;
  tool: ToolName;
};

export const useDrawLineTool = (refs: TCanvasRefs, { endPoint, name, startPoint, stroke, tool }: TLineToolConfig): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const startRef = useRef<TPoint | null>(null);
  const lastPointerClientPositionRef = useRef<TPoint | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerDown(canvas, event, dispatch, refs, viewport, startRef, lastPointerClientPositionRef);

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerMove(canvas, event, refs, viewport, startRef, lastPointerClientPositionRef, endPoint, startPoint, stroke);

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerUp(canvas, event, dispatch, appStore, refs, viewport, startRef, endPoint, startPoint, stroke, name);

  const onShiftKeyChange = (canvas: HTMLCanvasElement, event: KeyboardEvent): void =>
    handleShiftKeyChange(canvas, event, refs, viewport, startRef, lastPointerClientPositionRef, endPoint, startPoint, stroke);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === tool) {
      const onPointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const onPointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);
      const onPointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event);
      const shiftKeyDownListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event);
      const shiftKeyUpListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event);

      canvas.addEventListener('pointerdown', onPointerDownListener);
      canvas.addEventListener('pointermove', onPointerMoveListener);
      canvas.addEventListener('pointerup', onPointerUpListener);
      window.addEventListener('keydown', shiftKeyDownListener);
      window.addEventListener('keyup', shiftKeyUpListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDownListener);
        canvas.removeEventListener('pointermove', onPointerMoveListener);
        canvas.removeEventListener('pointerup', onPointerUpListener);
        window.removeEventListener('keydown', shiftKeyDownListener);
        window.removeEventListener('keyup', shiftKeyUpListener);
        lastPointerClientPositionRef.current = null;
      };
    }
  }, [activeTool, appStore, canvasRef, dispatch, endPoint, name, refs, startPoint, stroke, tool, viewport]);
};
