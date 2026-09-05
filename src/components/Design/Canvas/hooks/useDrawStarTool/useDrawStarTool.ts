import { useEffect, useRef } from 'react';

// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { useAppDispatch, useAppSelector, useAppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';
import { TCandidateShape } from '../../utils/getDragAlignmentSnap/getCandidateShapes';

export type TStarToolConfig = {
  fill: string;
  name: string;
  points: number;
  ratio: number;
  tool: ToolName;
};

export const useDrawStarTool = (refs: TCanvasRefs, { fill, name, points, ratio, tool }: TStarToolConfig): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const appStore = useAppStore();
  const startRef = useRef<TPoint | null>(null);
  const candidateShapesRef = useRef<TCandidateShape[]>([]);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerDown(canvas, event, dispatch, appStore, refs, viewport, startRef, candidateShapesRef);

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerMove(canvas, event, refs, viewport, startRef, candidateShapesRef, fill, points, ratio);

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerUp(canvas, event, dispatch, appStore, refs, viewport, startRef, candidateShapesRef, fill, name, points, ratio);

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
  }, [activeTool, appStore, canvasRef, dispatch, fill, name, points, ratio, refs, tool, viewport]);
};
