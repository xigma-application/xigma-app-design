import { useEffect, useRef } from 'react';

// others
import { DEFAULT_SHAPE_SIZE } from '../../constants';

// store
import { addNode, setActiveTool, setSelection } from 'store/design/slice';
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

export type TShapeToolConfig = {
  fill: string;
  name: string;
  tool: ToolName;
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section;
};

export const useDrawShapeTool = (refs: TCanvasRefs, { fill, name, tool, type }: TShapeToolConfig): void => {
  const { canvasRef, draftRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
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

      draftRef.current = { ...rect, fill, type };
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (startRef.current) {
      const rect = toDraftRectWithDefault(
        startRef.current,
        screenToWorld(getPointerPosition(canvas, event), viewport),
        DEFAULT_SHAPE_SIZE,
        true,
      );

      dispatch(addNode({ ...rect, fill, name, parentId: null, rotation: 0, type }));
      selectLastCreatedNode(dispatch, appStore);

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
  }, [activeTool, appStore, canvasRef, dispatch, draftRef, fill, name, tool, type, viewport]);
};
