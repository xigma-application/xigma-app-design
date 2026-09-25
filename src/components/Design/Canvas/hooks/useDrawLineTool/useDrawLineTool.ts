import { useEffect, useRef } from 'react';

// hooks
import { useActiveViewport } from 'hooks/useActiveViewport/useActiveViewport';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { LineEndpoint, ToolName } from 'types/design/enums';
import { TNewNodeDropTarget } from '../../utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';
import { handleShiftKeyChange } from './utils/handleShiftKeyChange/handleShiftKeyChange';

export type TLineToolConfig = {
  endPoint: LineEndpoint;
  name: string;
  startPoint: LineEndpoint;
  stroke: string;
  tool: ToolName;
};

export const useDrawLineTool = (refs: TCanvasRefs, { endPoint, name, startPoint, stroke, tool }: TLineToolConfig): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useActiveViewport(activeTool === tool);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const startRef = useRef<TPoint | null>(null);
  const nodeIdRef = useRef<string | null>(null);
  const lastPointerClientPositionRef = useRef<TPoint | null>(null);
  const dropTargetRef = useRef<TNewNodeDropTarget | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerDown(
      canvas,
      event,
      dispatch,
      appStore,
      refs,
      viewport,
      startRef,
      nodeIdRef,
      lastPointerClientPositionRef,
      dropTargetRef,
      endPoint,
      startPoint,
      stroke,
      name,
    );

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerMove(canvas, event, dispatch, viewport, startRef, nodeIdRef, lastPointerClientPositionRef);

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerUp(canvas, event, dispatch, refs, viewport, startRef, nodeIdRef, dropTargetRef);

  const onShiftKeyChange = (canvas: HTMLCanvasElement, event: KeyboardEvent): void =>
    handleShiftKeyChange(canvas, event, dispatch, viewport, startRef, nodeIdRef, lastPointerClientPositionRef);

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
