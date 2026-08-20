import { useEffect } from 'react';

// others
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// hooks
import { useSelectionToolRefs } from './hooks/useSelectionToolRefs/useSelectionToolRefs';

// store
import { selectActiveTool, selectEditingTextBox } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
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

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs): void => {
    handlePointerDown(canvas, event, dispatch, canvasRefs, selectRefs, setClassName);
  };

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs): void => {
    handlePointerMove(canvas, event, dispatch, canvasRefs, selectRefs, setClassName);
  };

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs): void => {
    handlePointerUp(canvas, event, dispatch, canvasRefs, selectRefs, setClassName);
  };

  const onPointerLeave = (canvasRefs: TCanvasRefs): void => {
    canvasRefs.hoveredVectorVertexIdRef.current = null;
    canvasRefs.hoveredVectorSegmentIdRef.current = null;
  };

  useEffect(() => {
    const canvas = refs.canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale) && !isCanvasCaretEditingActive) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event, refs, selectionRefs);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event, refs, selectionRefs);
      const pointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event, refs, selectionRefs);
      const pointerLeaveListener = (): void => onPointerLeave(refs);

      canvas.addEventListener('pointerdown', pointerDownListener);
      canvas.addEventListener('pointermove', pointerMoveListener);
      canvas.addEventListener('pointerup', pointerUpListener);
      canvas.addEventListener('pointerleave', pointerLeaveListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', pointerDownListener);
        canvas.removeEventListener('pointermove', pointerMoveListener);
        canvas.removeEventListener('pointerup', pointerUpListener);
        canvas.removeEventListener('pointerleave', pointerLeaveListener);
        refs.selectedVectorVertexIdsRef.current = [];
        refs.selectedVectorHandlesRef.current = [];
        refs.selectedVectorSegmentIdsRef.current = [];
      };
    }
  }, [activeTool, dispatch, isCanvasCaretEditingActive, refs, selectionRefs, setClassName]);
};
