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

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.button === MouseButton.primary) {
      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      dispatch(setSelection([]));
      startRef.current = screenToWorld(getPointerPosition(canvas, event), viewport);
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const current = screenToWorld(getPointerPosition(canvas, event), viewport);

      draftRef.current = {
        endPoint,
        startPoint,
        stroke,
        type: NodeType.line,
        x1: Math.round(startRef.current.x),
        x2: Math.round(current.x),
        y1: Math.round(startRef.current.y),
        y2: Math.round(current.y),
      };
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const current = screenToWorld(getPointerPosition(canvas, event), viewport);
      const length = Math.hypot(current.x - startRef.current.x, current.y - startRef.current.y);

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
            x2: Math.round(current.x),
            y1: Math.round(startRef.current.y),
            y2: Math.round(current.y),
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

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === tool) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
      };
    }
  }, [activeTool, appStore, canvasRef, dispatch, draftRef, endPoint, name, refs, startPoint, stroke, tool, viewport]);
};
