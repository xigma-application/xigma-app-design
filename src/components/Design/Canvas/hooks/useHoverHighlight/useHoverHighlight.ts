import { useEffect, useRef } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { handleModifierKeyChange } from './utils/handleModifierKeyChange';
import { resolveDistanceGuides } from './utils/resolveDistanceGuides';
import { resolveHover } from './utils/resolveHover/resolveHover';
import { setHoverState } from './utils/setHoverState';

export const useHoverHighlight = (refs: TCanvasRefs): void => {
  const { canvasRef, hover } = refs;
  const { hoverRef } = hover;
  const activeTool = useAppSelector(selectActiveTool);
  const { setClassName } = useClassNames();
  const lastPointerClientPositionRef = useRef<TPoint | null>(null);

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.buttons === 0) {
      lastPointerClientPositionRef.current = { x: event.clientX, y: event.clientY };
      resolveHover(canvas, event, hoverRef, setClassName, activeTool, refs);
      resolveDistanceGuides(event, activeTool, refs, setClassName);
    }
  };

  const handlePointerLeave = (canvas: HTMLCanvasElement): void => {
    lastPointerClientPositionRef.current = null;
    refs.transform.distanceGuidesRef.current = null;
    setHoverState(canvas, hoverRef, setClassName, activeTool === ToolName.comment ? 'comment' : null, '', null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale || activeTool === ToolName.comment)) {
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerLeave = (): void => handlePointerLeave(canvas);
      const onModifierKeyDown = (event: KeyboardEvent): void =>
        handleModifierKeyChange(canvas, event, lastPointerClientPositionRef, handlePointerMove);
      const onModifierKeyUp = (event: KeyboardEvent): void =>
        handleModifierKeyChange(canvas, event, lastPointerClientPositionRef, handlePointerMove);

      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
      window.addEventListener('keydown', onModifierKeyDown);
      window.addEventListener('keyup', onModifierKeyUp);

      return (): void => {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        window.removeEventListener('keydown', onModifierKeyDown);
        window.removeEventListener('keyup', onModifierKeyUp);
        lastPointerClientPositionRef.current = null;
        refs.transform.distanceGuidesRef.current = null;
        setHoverState(canvas, hoverRef, setClassName, null, '', null);
      };
    }
  }, [activeTool, canvasRef, hoverRef, setClassName]);
};
