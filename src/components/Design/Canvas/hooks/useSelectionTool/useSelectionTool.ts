import { RefObject, useEffect, useRef } from 'react';

// store
import { selectActiveTool, selectEditingTextBox } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TDragState, TEndpointDragState, TPathOffsetDragState, TResizeDragState, TRotateDragState } from './types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useSelectionTool = (canvasRef: RefObject<HTMLCanvasElement | null>, marqueeRef: RefObject<TDraftRect | null>): void => {
  const activeTool = useAppSelector(selectActiveTool);
  const editingPathId = useAppSelector(selectEditingTextBox)?.pathId;
  const dispatch = useAppDispatch();
  const dragStateRef = useRef<TDragState | null>(null);
  const endpointDragRef = useRef<TEndpointDragState | null>(null);
  const pathOffsetDragRef = useRef<TPathOffsetDragState | null>(null);
  const resizeDragRef = useRef<TResizeDragState | null>(null);
  const rotateDragRef = useRef<TRotateDragState | null>(null);
  const marqueeStartRef = useRef<TPoint | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale) && !editingPathId) {
      const onPointerDown = (event: PointerEvent): void =>
        handlePointerDown(
          canvas,
          event,
          dispatch,
          dragStateRef,
          endpointDragRef,
          pathOffsetDragRef,
          resizeDragRef,
          rotateDragRef,
          marqueeStartRef,
        );

      const onPointerMove = (event: PointerEvent): void =>
        handlePointerMove(
          canvas,
          event,
          dispatch,
          dragStateRef,
          endpointDragRef,
          pathOffsetDragRef,
          resizeDragRef,
          rotateDragRef,
          marqueeStartRef,
          marqueeRef,
        );

      const onPointerUp = (event: PointerEvent): void =>
        handlePointerUp(
          canvas,
          event,
          dispatch,
          dragStateRef,
          endpointDragRef,
          pathOffsetDragRef,
          resizeDragRef,
          rotateDragRef,
          marqueeStartRef,
          marqueeRef,
        );

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
      };
    }
  }, [activeTool, canvasRef, dispatch, editingPathId, marqueeRef]);
};
