import { useEffect, useRef } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// hooks
import { useIsSpaceHeld } from './hooks/useIsSpaceHeld';

// store
import { selectActiveTool } from 'store/design/selectors';
import { setTemporaryActiveTool } from 'store/design/slice';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useHandTool = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const isSpaceHeld = useIsSpaceHeld();
  const dispatch = useAppDispatch();
  const { setClassName } = useClassNames();
  const lastPointRef = useRef<TPoint | null>(null);
  const toolBeforeSpaceRef = useRef<ToolName>(ToolName.default);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerDown(canvas, event, lastPointRef, setClassName);

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => handlePointerMove(canvas, event, dispatch, lastPointRef);

  const onPointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => handlePointerUp(canvas, event, lastPointRef, setClassName);

  useEffect(() => {
    if (isSpaceHeld) {
      toolBeforeSpaceRef.current = selectActiveTool(store.getState());
      dispatch(setTemporaryActiveTool(ToolName.hand));

      return (): void => {
        dispatch(setTemporaryActiveTool(toolBeforeSpaceRef.current));
      };
    }
  }, [dispatch, isSpaceHeld]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.hand) {
      const onPointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const onPointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);
      const onPointerUpListener = (event: PointerEvent): void => onPointerUp(canvas, event);

      setClassName('hand');
      canvas.addEventListener('pointerdown', onPointerDownListener);
      canvas.addEventListener('pointermove', onPointerMoveListener);
      canvas.addEventListener('pointerup', onPointerUpListener);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDownListener);
        canvas.removeEventListener('pointermove', onPointerMoveListener);
        canvas.removeEventListener('pointerup', onPointerUpListener);
        setClassName(null);
        lastPointRef.current = null;
      };
    }
  }, [activeTool, canvasRef, dispatch, setClassName]);
};
