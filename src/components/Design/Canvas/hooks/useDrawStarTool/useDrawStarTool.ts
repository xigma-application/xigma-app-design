import { useEffect, useRef } from 'react';

// others
import { DEFAULT_SHAPE_SIZE } from '../../constants';

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
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../utils/getPointerPosition';
import { screenToWorld } from '../../utils/screenToWorld';
import { selectLastCreatedNode } from '../../utils/selectLastCreatedNode';
import { toDraftRect } from '../../utils/toDraftRect';
import { toDraftRectWithDefault } from '../../utils/toDraftRectWithDefault';

export type TStarToolConfig = {
  fill: string;
  name: string;
  points: number;
  ratio: number;
  tool: ToolName;
};

export const useDrawStarTool = (refs: TCanvasRefs, { fill, name, points, ratio, tool }: TStarToolConfig): void => {
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
      const rect = toDraftRect(startRef.current, screenToWorld(getPointerPosition(canvas, event), viewport));

      draftRef.current = { ...rect, fill, points, ratio, type: NodeType.star };
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const rect = toDraftRectWithDefault(
        startRef.current,
        screenToWorld(getPointerPosition(canvas, event), viewport),
        DEFAULT_SHAPE_SIZE,
        true,
        viewport.zoom,
      );

      dispatch(
        addNode({ ...rect, fill, flipX: false, flipY: false, name, parentId: null, points, ratio, rotation: 0, type: NodeType.star }),
      );
      selectLastCreatedNode(dispatch, appStore);

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
  }, [activeTool, appStore, canvasRef, dispatch, draftRef, fill, name, points, ratio, refs, tool, viewport]);
};
