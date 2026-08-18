import { useEffect } from 'react';

// others
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { resolveHover } from './utils/resolveHover/resolveHover';
import { setHoverState } from './utils/setHoverState';

export const useHoverHighlight = (refs: TCanvasRefs): void => {
  const { canvasRef, hoverRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const { setClassName } = useClassNames();

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.buttons === 0) {
      resolveHover(canvas, event, hoverRef, setClassName, activeTool);
    }
  };

  const handlePointerLeave = (canvas: HTMLCanvasElement): void =>
    setHoverState(canvas, hoverRef, setClassName, activeTool === ToolName.comment ? 'comment' : null, '', null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale || activeTool === ToolName.comment)) {
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerLeave = (): void => handlePointerLeave(canvas);

      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);

      return (): void => {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        setHoverState(canvas, hoverRef, setClassName, null, '', null);
      };
    }
  }, [activeTool, canvasRef, hoverRef, setClassName]);
};
