import { useEffect, useRef } from 'react';

// others
import { MIN_SHAPE_SIZE } from '../../constants';

// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { NodeType, ToolName } from 'types/design/enums';
import { MouseButton } from 'types/enums';
import { TLineEndpointStyle } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getAngleSnappedVectorPoint } from 'utils/canvas/vectorNetwork/getAngleSnappedVectorPoint';
import { getPointerPosition } from '../../utils/getPointerPosition';
import { screenToWorld } from '../../utils/screenToWorld';
import { selectLastCreatedNode } from '../../utils/selectLastCreatedNode';

export type TLineToolConfig = {
  endPoint: TLineEndpointStyle;
  name: string;
  startPoint: TLineEndpointStyle;
  stroke: string;
  tool: ToolName;
};

export const useDrawLineTool = (refs: TCanvasRefs, { endPoint, name, startPoint, stroke, tool }: TLineToolConfig): void => {
  const { canvasRef, draftRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const startRef = useRef<TPoint | null>(null);
  const lastPointerClientPositionRef = useRef<TPoint | null>(null);

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };

    if (event.button === MouseButton.primary) {
      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      dispatch(setSelection([]));
      startRef.current = screenToWorld(getPointerPosition(canvas, event), viewport);
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };

    if (startRef.current) {
      const current = screenToWorld(getPointerPosition(canvas, event), viewport);
      const { point } = getAngleSnappedVectorPoint(startRef.current, current, viewport.zoom, event.shiftKey);

      draftRef.current = {
        endPoint,
        startPoint,
        stroke,
        type: NodeType.line,
        x1: Math.round(startRef.current.x),
        x2: Math.round(point.x),
        y1: Math.round(startRef.current.y),
        y2: Math.round(point.y),
      };
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const current = screenToWorld(getPointerPosition(canvas, event), viewport);
      const { point } = getAngleSnappedVectorPoint(startRef.current, current, viewport.zoom, event.shiftKey);
      const length = Math.hypot(point.x - startRef.current.x, point.y - startRef.current.y);

      if (length >= MIN_SHAPE_SIZE) {
        dispatch(
          addNode({
            endPoint,
            name,
            parentId: null,
            startPoint,
            stroke,
            type: NodeType.line,
            x1: Math.round(startRef.current.x),
            x2: Math.round(point.x),
            y1: Math.round(startRef.current.y),
            y2: Math.round(point.y),
          }),
        );
        selectLastCreatedNode(dispatch, appStore);
      }

      startRef.current = null;
      draftRef.current = null;
      canvas.releasePointerCapture(event.pointerId);
      dispatch(setActiveTool(ToolName.default));
    }

    dispatch(endHistoryGesture());
  };

  const onShiftKeyChange = (canvas: HTMLCanvasElement, event: KeyboardEvent): void => {
    if (event.key === 'Shift' && startRef.current && lastPointerClientPositionRef.current) {
      const { x, y } = lastPointerClientPositionRef.current;

      handlePointerMove(canvas, new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: -1, shiftKey: event.shiftKey }));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === tool) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event);
      const shiftKeyDownListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event);
      const shiftKeyUpListener = (event: KeyboardEvent): void => onShiftKeyChange(canvas, event);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      window.addEventListener('keydown', shiftKeyDownListener);
      window.addEventListener('keyup', shiftKeyUpListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('keydown', shiftKeyDownListener);
        window.removeEventListener('keyup', shiftKeyUpListener);
        lastPointerClientPositionRef.current = null;
      };
    }
  }, [activeTool, appStore, canvasRef, dispatch, draftRef, endPoint, name, refs, startPoint, stroke, tool, viewport]);
};
