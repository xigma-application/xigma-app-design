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
import { adjustEraserDiameter } from './utils/adjustEraserDiameter';
import { cancelVectorSegmentBendDrag } from './utils/cancelVectorSegmentBendDrag';
import { handleAltKeyChange } from './utils/handleAltKeyChange/handleAltKeyChange';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';
import { handleShiftKeyChange } from './utils/handleShiftKeyChange/handleShiftKeyChange';
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
    canvasRefs.hover.hoveredVectorVertexIdRef.current = null;
    canvasRefs.hover.hoveredVectorSegmentIdRef.current = null;
    canvasRefs.vectorErase.eraseBrushCenterRef.current = null;
    canvasRefs.transform.contactGuidesRef.current = null;
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    cancelVectorSegmentBendDrag(event, dispatch, selectionRefs.vectorSegmentBendDragRef, setClassName);
    adjustEraserDiameter(event, activeTool, refs.vectorErase.eraserDiameterRef);
  };

  const onShiftKeyChange = (
    canvas: HTMLCanvasElement,
    event: KeyboardEvent,
    canvasRefs: TCanvasRefs,
    selectRefs: TSelectionToolRefs,
  ): void => {
    handleShiftKeyChange(canvas, event, canvasRefs, selectRefs, lastPointerClientPositionRef.current, onPointerMove);
  };

  const onAltKeyChange = (
    canvas: HTMLCanvasElement,
    event: KeyboardEvent,
    canvasRefs: TCanvasRefs,
    selectRefs: TSelectionToolRefs,
  ): void => {
    handleAltKeyChange(canvas, event, canvasRefs, selectRefs, activeTool, lastPointerClientPositionRef.current, onPointerMove);
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
        activeTool === ToolName.bend ||
        activeTool === ToolName.cut ||
        activeTool === ToolName.erase ||
        activeTool === ToolName.shapeBuilder ||
        activeTool === ToolName.variableWidth) &&
      !isCanvasCaretEditingActive
    ) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event, refs, selectionRefs);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event, refs, selectionRefs);
      const pointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event, refs, selectionRefs);
      const pointerLeaveListener = (): void => onPointerLeave(refs);
      const keyDownListener = (event: KeyboardEvent): void => onKeyDown(event);
      const shiftKeyDownListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event, refs, selectionRefs);
      const shiftKeyUpListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event, refs, selectionRefs);
      const altKeyDownListener = (event: KeyboardEvent): void => onAltKeyChange(canvas, event, refs, selectionRefs);
      const altKeyUpListener = (event: KeyboardEvent): void => onAltKeyChange(canvas, event, refs, selectionRefs);

      canvas.addEventListener('pointerdown', pointerDownListener);
      canvas.addEventListener('pointermove', pointerMoveListener);
      canvas.addEventListener('pointerup', pointerUpListener);
      canvas.addEventListener('pointerleave', pointerLeaveListener);
      window.addEventListener('keydown', keyDownListener);
      window.addEventListener('keydown', shiftKeyDownListener);
      window.addEventListener('keyup', shiftKeyUpListener);
      window.addEventListener('keydown', altKeyDownListener);
      window.addEventListener('keyup', altKeyUpListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', pointerDownListener);
        canvas.removeEventListener('pointermove', pointerMoveListener);
        canvas.removeEventListener('pointerup', pointerUpListener);
        canvas.removeEventListener('pointerleave', pointerLeaveListener);
        window.removeEventListener('keydown', keyDownListener);
        window.removeEventListener('keydown', shiftKeyDownListener);
        window.removeEventListener('keyup', shiftKeyUpListener);
        window.removeEventListener('keydown', altKeyDownListener);
        window.removeEventListener('keyup', altKeyUpListener);
        refs.vectorEdit.selectedVectorVertexIdsRef.current = [];
        refs.vectorEdit.selectedVectorHandlesRef.current = [];
        refs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
        refs.vectorEdit.snappedVectorHandleRef.current = null;
        refs.vectorEdit.vectorAlignmentGuideRef.current = null;
        refs.lassoMarquee.vectorLassoPathRef.current = null;
        refs.hover.hoveredVectorPaintFaceKeyRef.current = null;
        refs.hover.hoveredVectorFaceSelectRef.current = null;
        refs.vectorCut.vectorCutPreviewRef.current = null;
        refs.vectorPaint.vectorPaintPathRef.current = null;
        refs.vectorPaint.touchedVectorPaintLoopKeysRef.current = {};
        refs.vectorPaint.vectorPaintTouchedFacesRef.current = null;
        refs.vectorPaint.isVectorPaintRemoveRef.current = false;
        refs.shapeBuilder.vectorShapeBuilderPathRef.current = null;
        refs.shapeBuilder.touchedVectorShapeBuilderFacesRef.current = {};
        refs.hover.hoveredVectorShapeBuilderFaceRef.current = null;
        refs.shapeBuilder.isVectorShapeBuilderBoxModeRef.current = false;
        refs.shapeBuilder.isVectorShapeBuilderSubtractRef.current = false;
        refs.hover.hoveredVectorWidthPointRef.current = null;
        refs.vectorWidth.vectorWidthPointDragRef.current = null;
        refs.vectorEdit.selectedVectorWidthHandlesRef.current = [];
        refs.vectorEdit.lastVectorWidthHandleSideRef.current = null;
        selectionRefs.vectorCutDragRef.current = null;
        refs.transform.contactGuidesRef.current = null;
        lastPointerClientPositionRef.current = null;
      };
    }
  }, [activeTool, dispatch, isCanvasCaretEditingActive, refs, selectionRefs, setClassName]);
};
