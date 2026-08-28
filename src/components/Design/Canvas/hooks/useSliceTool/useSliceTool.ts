import { useEffect, useRef } from 'react';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TSliceDrawDragState, TSliceMoveDragState, TSliceResizeDragState, TSliceRotateDragState } from './types';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useSliceTool = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const { sliceRef } = refs.slice;
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const drawDragRef = useRef<TSliceDrawDragState | null>(null);
  const resizeDragRef = useRef<TSliceResizeDragState | null>(null);
  const rotateDragRef = useRef<TSliceRotateDragState | null>(null);
  const moveDragRef = useRef<TSliceMoveDragState | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.slice) {
      const onPointerDown = (event: PointerEvent): void =>
        handlePointerDown(canvas, event, dispatch, sliceRef, drawDragRef, resizeDragRef, rotateDragRef, moveDragRef);

      const onPointerMove = (event: PointerEvent): void =>
        handlePointerMove(canvas, event, sliceRef, drawDragRef, resizeDragRef, rotateDragRef, moveDragRef);

      const onPointerUp = (event: PointerEvent): void =>
        handlePointerUp(canvas, event, sliceRef, drawDragRef, resizeDragRef, rotateDragRef, moveDragRef);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.style.cursor = '';
        sliceRef.current = null;
        drawDragRef.current = null;
        resizeDragRef.current = null;
        rotateDragRef.current = null;
        moveDragRef.current = null;
      };
    }
  }, [activeTool, canvasRef, dispatch, sliceRef]);
};
