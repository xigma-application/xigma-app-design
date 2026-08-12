import { RefObject, useEffect, useRef } from 'react';

// others
import { MIN_SHAPE_SIZE } from '../../constants';

// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { MouseButton } from 'types/enums';
import { TDraftEntity } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../utils/getPointerPosition';
import { screenToWorld } from '../../utils/screenToWorld';

export type TLineToolConfig = {
  name: string;
  stroke: string;
  tool: ToolName;
};

export const useDrawLineTool = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draftRef: RefObject<TDraftEntity | null>,
  { name, stroke, tool }: TLineToolConfig,
): void => {
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const startRef = useRef<TPoint | null>(null);

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.button === MouseButton.primary) {
      dispatch(setSelection([]));
      startRef.current = screenToWorld(getPointerPosition(canvas, event), viewport);
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const current = screenToWorld(getPointerPosition(canvas, event), viewport);

      draftRef.current = { stroke, type: NodeType.line, x1: startRef.current.x, x2: current.x, y1: startRef.current.y, y2: current.y };
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const current = screenToWorld(getPointerPosition(canvas, event), viewport);
      const length = Math.hypot(current.x - startRef.current.x, current.y - startRef.current.y);

      if (length >= MIN_SHAPE_SIZE) {
        dispatch(
          addNode({
            name,
            parentId: null,
            stroke,
            type: NodeType.line,
            x1: startRef.current.x,
            x2: current.x,
            y1: startRef.current.y,
            y2: current.y,
          }),
        );
      }

      startRef.current = null;
      draftRef.current = null;
      canvas.releasePointerCapture(event.pointerId);
      dispatch(setActiveTool(ToolName.default));
    }
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
  }, [activeTool, canvasRef, dispatch, draftRef, name, stroke, tool, viewport]);
};
