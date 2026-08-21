import { useEffect, useRef } from 'react';

// core
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
    penDraggedHandleIsSnappedRef,
    penDraggedHandlePositionRef,
    penHoveredDragArmableVertexRef,
    penNewVertexPreviewRef,
    penPreviewRef,
    vectorAlignmentGuideRef,
  } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const { setClassName } = useClassNames();
  const dragStartRef = useRef<TPoint | null>(null);
  const pendingOutgoingTangentRef = useRef<TPendingOutgoingTangent | null>(null);
  const lastPointerClientPositionRef = useRef<TPoint | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
    penPreviewRef.current = null;
    handlePointerDown(canvas, event, dispatch, appStore, dragOriginRef, dragStartRef, pendingOutgoingTangentRef, vectorAlignmentGuideRef);
  };

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
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
      penDraggedHandleIsSnappedRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      vectorAlignmentGuideRef,
      setClassName,
    );
  };

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    handlePointerUp(canvas, event, dispatch, dragOriginRef, dragStartRef, penDraggedHandlePositionRef, penDraggedHandleIsSnappedRef);
    vectorAlignmentGuideRef.current = null;
  };

  const onPointerCancel = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    handlePointerCancel(canvas, event, dispatch, dragOriginRef, dragStartRef, penDraggedHandlePositionRef, penDraggedHandleIsSnappedRef);
    vectorAlignmentGuideRef.current = null;
  };

  const onShiftKeyChange = (canvas: HTMLCanvasElement, event: KeyboardEvent): void => {
    if (event.key === 'Shift' && lastPointerClientPositionRef.current) {
      const { x, y } = lastPointerClientPositionRef.current;

      onPointerMove(canvas, new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: -1, shiftKey: event.shiftKey }));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.pen) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);
      const pointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event);
      const pointerCancelListener = (event: PointerEvent): void => onPointerCancel(canvas, event);
      const shiftKeyDownListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event);
      const shiftKeyUpListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event);

      canvas.addEventListener('pointerdown', pointerDownListener);
      canvas.addEventListener('pointermove', pointerMoveListener);
      canvas.addEventListener('pointerup', pointerUpListener);
      canvas.addEventListener('pointercancel', pointerCancelListener);
      window.addEventListener('keydown', shiftKeyDownListener);
      window.addEventListener('keyup', shiftKeyUpListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', pointerDownListener);
        canvas.removeEventListener('pointermove', pointerMoveListener);
        canvas.removeEventListener('pointerup', pointerUpListener);
        canvas.removeEventListener('pointercancel', pointerCancelListener);
        window.removeEventListener('keydown', shiftKeyDownListener);
        window.removeEventListener('keyup', shiftKeyUpListener);
        penPreviewRef.current = null;
        penNewVertexPreviewRef.current = null;
        dragOriginRef.current = null;
        penDraggedHandlePositionRef.current = null;
        penDraggedHandleIsSnappedRef.current = false;
        hoveredSegmentIdRef.current = null;
        penHoveredDragArmableVertexRef.current = false;
        lastPointerClientPositionRef.current = null;
        vectorAlignmentGuideRef.current = null;
      };
    }
  }, [
    activeTool,
    appStore,
    canvasRef,
    dispatch,
    dragOriginRef,
    hoveredSegmentIdRef,
    penDraggedHandleIsSnappedRef,
    penDraggedHandlePositionRef,
    penHoveredDragArmableVertexRef,
    penNewVertexPreviewRef,
    penPreviewRef,
    setClassName,
    vectorAlignmentGuideRef,
  ]);
};
