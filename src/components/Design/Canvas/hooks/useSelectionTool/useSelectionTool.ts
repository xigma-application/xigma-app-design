import { RefObject, useEffect, useRef } from 'react';

// others
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectActiveTool, selectEditingTextBox } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import {
  TCornerRadiusDragState,
  TDragState,
  TEllipseArcDragState,
  TEllipseArcRatioDragState,
  TEllipseArcRotateDragState,
  TEndpointDragState,
  TPathOffsetDragState,
  TPolygonCornerRadiusDragState,
  TPolygonVertexCountDragState,
  TResizeDragState,
  TRotateDragState,
  TStarCornerRadiusDragState,
  TStarVertexCountDragState,
} from './types';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';
import { shouldUseCanvasCaretEditing } from '../../utils/shouldUseCanvasCaretEditing';

export const useSelectionTool = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  marqueeRef: RefObject<TDraftRect | null>,
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>,
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>,
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>,
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>,
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>,
): void => {
  const { setClassName } = useClassNames();
  const activeTool = useAppSelector(selectActiveTool);
  const editingTextBox = useAppSelector(selectEditingTextBox);
  const isCanvasCaretEditingActive = shouldUseCanvasCaretEditing(editingTextBox);
  const dispatch = useAppDispatch();
  const dragStateRef = useRef<TDragState | null>(null);
  const endpointDragRef = useRef<TEndpointDragState | null>(null);
  const pathOffsetDragRef = useRef<TPathOffsetDragState | null>(null);
  const resizeDragRef = useRef<TResizeDragState | null>(null);
  const rotateDragRef = useRef<TRotateDragState | null>(null);
  const polygonVertexCountDragRef = useRef<TPolygonVertexCountDragState | null>(null);
  const starVertexCountDragRef = useRef<TStarVertexCountDragState | null>(null);
  const marqueeStartRef = useRef<TPoint | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale) && !isCanvasCaretEditingActive) {
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
          cornerRadiusDragRef,
          polygonCornerRadiusDragRef,
          starCornerRadiusDragRef,
          polygonVertexCountDragRef,
          starVertexCountDragRef,
          ellipseArcDragRef,
          ellipseArcRotateDragRef,
          ellipseArcRatioDragRef,
          marqueeStartRef,
          setClassName,
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
          cornerRadiusDragRef,
          polygonCornerRadiusDragRef,
          starCornerRadiusDragRef,
          polygonVertexCountDragRef,
          starVertexCountDragRef,
          ellipseArcDragRef,
          ellipseArcRotateDragRef,
          ellipseArcRatioDragRef,
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
          cornerRadiusDragRef,
          polygonCornerRadiusDragRef,
          starCornerRadiusDragRef,
          polygonVertexCountDragRef,
          starVertexCountDragRef,
          ellipseArcDragRef,
          ellipseArcRotateDragRef,
          ellipseArcRatioDragRef,
          marqueeStartRef,
          marqueeRef,
          setClassName,
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
  }, [
    activeTool,
    canvasRef,
    cornerRadiusDragRef,
    dispatch,
    ellipseArcDragRef,
    ellipseArcRatioDragRef,
    ellipseArcRotateDragRef,
    isCanvasCaretEditingActive,
    marqueeRef,
    polygonCornerRadiusDragRef,
    setClassName,
    starCornerRadiusDragRef,
  ]);
};
