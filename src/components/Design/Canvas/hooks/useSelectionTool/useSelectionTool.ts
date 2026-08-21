import { useEffect, useRef } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// hooks
import { useSelectionToolRefs } from './hooks/useSelectionToolRefs/useSelectionToolRefs';

// store
import { selectActiveTool, selectEditingTextBox } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { cancelVectorSegmentBendDrag } from './utils/cancelVectorSegmentBendDrag';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';
import { shouldUseCanvasCaretEditing } from '../../utils/shouldUseCanvasCaretEditing';

export const useSelectionTool = (refs: TCanvasRefs): void => {
  const { setClassName } = useClassNames();
  const activeTool = useAppSelector(selectActiveTool);
  const editingTextBox = useAppSelector(selectEditingTextBox);
  const isCanvasCaretEditingActive = shouldUseCanvasCaretEditing(editingTextBox);
  const dispatch = useAppDispatch();
  const selectionRefs = useSelectionToolRefs();
  const lastPointerClientPositionRef = useRef<TPoint | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
    handlePointerDown(canvas, event, dispatch, canvasRefs, selectRefs, setClassName);
  };

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
    handlePointerMove(canvas, event, dispatch, canvasRefs, selectRefs, setClassName);
  };

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs): void => {
    handlePointerUp(canvas, event, dispatch, canvasRefs, selectRefs, setClassName);
  };

  const onPointerLeave = (canvasRefs: TCanvasRefs): void => {
    canvasRefs.hoveredVectorVertexIdRef.current = null;
    canvasRefs.hoveredVectorSegmentIdRef.current = null;
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    cancelVectorSegmentBendDrag(event, dispatch, selectionRefs.vectorSegmentBendDragRef, setClassName);
  };

  const onShiftKeyChange = (
    canvas: HTMLCanvasElement,
    event: KeyboardEvent,
    canvasRefs: TCanvasRefs,
    selectRefs: TSelectionToolRefs,
  ): void => {
    if (event.key === 'Shift' && selectRefs.vectorHandleDragRef.current && lastPointerClientPositionRef.current) {
      const { x, y } = lastPointerClientPositionRef.current;

      onPointerMove(
        canvas,
        new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: -1, shiftKey: event.shiftKey }),
        canvasRefs,
        selectRefs,
      );
    }
  };

  useEffect(() => {
    const canvas = refs.canvasRef.current;

    if (
      canvas &&
      (activeTool === ToolName.default ||
        activeTool === ToolName.move ||
        activeTool === ToolName.scale ||
        activeTool === ToolName.lasso ||
        activeTool === ToolName.paint ||
        activeTool === ToolName.bend) &&
      !isCanvasCaretEditingActive
    ) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event, refs, selectionRefs);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event, refs, selectionRefs);
      const pointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event, refs, selectionRefs);
      const pointerLeaveListener = (): void => onPointerLeave(refs);
      const keyDownListener = (event: KeyboardEvent): void => onKeyDown(event);
      const shiftKeyDownListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event, refs, selectionRefs);
      const shiftKeyUpListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event, refs, selectionRefs);

      canvas.addEventListener('pointerdown', pointerDownListener);
      canvas.addEventListener('pointermove', pointerMoveListener);
      canvas.addEventListener('pointerup', pointerUpListener);
      canvas.addEventListener('pointerleave', pointerLeaveListener);
      window.addEventListener('keydown', keyDownListener);
      window.addEventListener('keydown', shiftKeyDownListener);
      window.addEventListener('keyup', shiftKeyUpListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', pointerDownListener);
        canvas.removeEventListener('pointermove', pointerMoveListener);
        canvas.removeEventListener('pointerup', pointerUpListener);
        canvas.removeEventListener('pointerleave', pointerLeaveListener);
        window.removeEventListener('keydown', keyDownListener);
        window.removeEventListener('keydown', shiftKeyDownListener);
        window.removeEventListener('keyup', shiftKeyUpListener);
        refs.selectedVectorVertexIdsRef.current = [];
        refs.selectedVectorHandlesRef.current = [];
        refs.selectedVectorSegmentIdsRef.current = [];
        refs.snappedVectorHandleRef.current = null;
        refs.vectorAlignmentGuideRef.current = null;
        refs.vectorLassoPathRef.current = null;
        refs.hoveredVectorPaintFaceKeyRef.current = null;
        lastPointerClientPositionRef.current = null;
      };
    }
  }, [activeTool, dispatch, isCanvasCaretEditingActive, refs, selectionRefs, setClassName]);
};
