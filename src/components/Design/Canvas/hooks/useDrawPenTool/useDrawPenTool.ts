import { useEffect, useRef } from 'react';

// hooks
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPendingOutgoingTangent } from './types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerCancel } from './utils/handlePointerCancel/handlePointerCancel';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useDrawPenTool = (refs: TCanvasRefs): void => {
  const {
    canvasRef,
    hoveredSegmentIdRef,
    penDragOriginRef: dragOriginRef,
    penDraggedHandlePositionRef,
    penHoveredDragArmableVertexRef,
    penNewVertexPreviewRef,
    penPreviewRef,
  } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const { setClassName } = useClassNames();
  const dragStartRef = useRef<TPoint | null>(null);
  const pendingOutgoingTangentRef = useRef<TPendingOutgoingTangent | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    penPreviewRef.current = null;
    handlePointerDown(canvas, event, dispatch, appStore, dragOriginRef, dragStartRef, pendingOutgoingTangentRef);
  };

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    handlePointerMove(
      canvas,
      event,
      dispatch,
      appStore,
      dragOriginRef,
      dragStartRef,
      pendingOutgoingTangentRef,
      penPreviewRef,
      penNewVertexPreviewRef,
      penDraggedHandlePositionRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      setClassName,
    );
  };

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    handlePointerUp(canvas, event, dispatch, dragOriginRef, dragStartRef, penDraggedHandlePositionRef);
  };

  const onPointerCancel = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    handlePointerCancel(canvas, event, dispatch, dragOriginRef, dragStartRef, penDraggedHandlePositionRef);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.pen) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);
      const pointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event);
      const pointerCancelListener = (event: PointerEvent): void => onPointerCancel(canvas, event);

      canvas.addEventListener('pointerdown', pointerDownListener);
      canvas.addEventListener('pointermove', pointerMoveListener);
      canvas.addEventListener('pointerup', pointerUpListener);
      canvas.addEventListener('pointercancel', pointerCancelListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', pointerDownListener);
        canvas.removeEventListener('pointermove', pointerMoveListener);
        canvas.removeEventListener('pointerup', pointerUpListener);
        canvas.removeEventListener('pointercancel', pointerCancelListener);
        penPreviewRef.current = null;
        penNewVertexPreviewRef.current = null;
        dragOriginRef.current = null;
        penDraggedHandlePositionRef.current = null;
        hoveredSegmentIdRef.current = null;
        penHoveredDragArmableVertexRef.current = false;
      };
    }
  }, [
    activeTool,
    appStore,
    canvasRef,
    dispatch,
    dragOriginRef,
    hoveredSegmentIdRef,
    penDraggedHandlePositionRef,
    penHoveredDragArmableVertexRef,
    penNewVertexPreviewRef,
    penPreviewRef,
    setClassName,
  ]);
};
