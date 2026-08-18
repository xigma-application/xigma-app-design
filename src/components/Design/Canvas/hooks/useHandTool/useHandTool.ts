import { useEffect, useRef } from 'react';

// others
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { setViewport } from 'store/design/slice';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { MouseButton } from 'types/enums';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { applyDragPan } from '../useCanvasDragPan/utils/applyDragPan';
import { getPointerPosition } from '../../utils/getPointerPosition';

export const useHandTool = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();
  const { setClassName } = useClassNames();
  const lastPointRef = useRef<TPoint | null>(null);

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.button === MouseButton.primary) {
      lastPointRef.current = getPointerPosition(canvas, event);
      canvas.setPointerCapture(event.pointerId);
      setClassName('pressing');
    }
  };

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (lastPointRef.current) {
      const point = getPointerPosition(canvas, event);
      const viewport = selectViewport(store.getState());

      dispatch(setViewport(applyDragPan(viewport, point.x - lastPointRef.current.x, point.y - lastPointRef.current.y)));
      lastPointRef.current = point;
    }
  };

  const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (lastPointRef.current) {
      lastPointRef.current = null;
      canvas.releasePointerCapture(event.pointerId);
      setClassName('hand');
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.hand) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event);

      setClassName('hand');
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        setClassName(null);
        lastPointRef.current = null;
      };
    }
  }, [activeTool, canvasRef, dispatch, setClassName]);
};
