import { useEffect } from 'react';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { handlePointerDown } from './utils/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp';

export const useGuideTool = (refs: TCanvasRefs): void => {
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const canvas = refs.canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale)) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event, dispatch, refs);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event, refs);
      const onPointerUp = (event: PointerEvent): void => handlePointerUp(canvas, event, dispatch, refs);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        refs.guides.draggingGuideRef.current = null;
      };
    }
  }, [activeTool, dispatch, refs]);
};
