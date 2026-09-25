import { useEffect, useRef } from 'react';

// hooks
import { useActiveViewport } from 'hooks/useActiveViewport/useActiveViewport';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { NodeType, ToolName } from 'types/design/enums';
import { TNewNodeDropTarget } from '../../utils/resolveNewNodeDropTarget/types';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';
import { TCandidateShape } from '../../utils/getDragAlignmentSnap/getCandidateShapes';

export type TShapeToolConfig = {
  fill: string;
  name: string;
  tool: ToolName;
  type: NodeType.ellipse | NodeType.frame | NodeType.rectangle | NodeType.section | NodeType.slice;
};

export const useDrawShapeTool = (refs: TCanvasRefs, { fill, name, tool, type }: TShapeToolConfig): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useActiveViewport(activeTool === tool);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const startRef = useRef<TPoint | null>(null);
  const nodeIdRef = useRef<string | null>(null);
  const candidateShapesRef = useRef<TCandidateShape[]>([]);
  const dropTargetRef = useRef<TNewNodeDropTarget | null>(null);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerDown(
      canvas,
      event,
      dispatch,
      appStore,
      refs,
      viewport,
      startRef,
      nodeIdRef,
      candidateShapesRef,
      dropTargetRef,
      fill,
      name,
      type,
    );

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerMove(canvas, event, dispatch, refs, viewport, startRef, nodeIdRef, candidateShapesRef);

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerUp(canvas, event, dispatch, refs, viewport, startRef, nodeIdRef, candidateShapesRef, dropTargetRef);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === tool) {
      const onPointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const onPointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);
      const onPointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event);

      canvas.addEventListener('pointerdown', onPointerDownListener);
      canvas.addEventListener('pointermove', onPointerMoveListener);
      canvas.addEventListener('pointerup', onPointerUpListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDownListener);
        canvas.removeEventListener('pointermove', onPointerMoveListener);
        canvas.removeEventListener('pointerup', onPointerUpListener);
      };
    }
  }, [activeTool, appStore, canvasRef, dispatch, fill, name, refs, tool, type, viewport]);
};
