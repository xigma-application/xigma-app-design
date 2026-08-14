import { RefObject, useEffect, useRef } from 'react';

// others
import { MIN_SHAPE_SIZE, PATH_NAME } from '../../constants';

// store
import { addNode, setActiveTool, setSelection, startTextEdit } from 'store/design/slice';
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType, PathType, ToolName } from 'types/design/enums';
import { MouseButton } from 'types/enums';
import { TDraftEntity } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../utils/getPointerPosition';
import { screenToWorld } from '../../utils/screenToWorld';
import { toDraftRect } from '../../utils/toDraftRect';

export const useDrawTextOnPathTool = (canvasRef: RefObject<HTMLCanvasElement | null>, draftRef: RefObject<TDraftEntity | null>): void => {
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
      const rect = toDraftRect(startRef.current, screenToWorld(getPointerPosition(canvas, event), viewport));

      draftRef.current = { ...rect, pathType: PathType.ellipse, type: NodeType.path };
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const rect = toDraftRect(startRef.current, screenToWorld(getPointerPosition(canvas, event), viewport));

      if (rect.width >= MIN_SHAPE_SIZE && rect.height >= MIN_SHAPE_SIZE) {
        dispatch(addNode({ ...rect, name: PATH_NAME, parentId: null, pathType: PathType.ellipse, rotation: 0, type: NodeType.path }));

        const { rootOrder } = store.getState().design;
        const pathNodeId = rootOrder[rootOrder.length - 1];

        dispatch(setSelection([pathNodeId]));
        dispatch(
          startTextEdit({
            box: { ...rect, flipX: false, flipY: false, pathFlip: false, pathId: pathNodeId, pathStartOffset: 0, rotation: 0 },
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

    if (canvas && activeTool === ToolName.textOnPath) {
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
  }, [activeTool, canvasRef, dispatch, draftRef, viewport]);
};
