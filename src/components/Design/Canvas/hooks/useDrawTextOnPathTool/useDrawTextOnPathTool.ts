import { useEffect, useRef } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useDrawTextOnPathTool = (refs: TCanvasRefs): void => {
  const { canvasRef, draftRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const viewport = useAppSelector(selectViewport);
  const dispatch = useAppDispatch();
  const { setClassName } = useClassNames();
  const startRef = useRef<TPoint | null>(null);
  const attachTargetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.textOnPath) {
      const onPointerDown = (event: PointerEvent): void =>
        handlePointerDown(canvas, event, dispatch, refs, viewport, startRef, attachTargetIdRef);
      const onPointerMove = (event: PointerEvent): void =>
        handlePointerMove(canvas, event, viewport, draftRef, startRef, attachTargetIdRef, setClassName);
      const onPointerUp = (event: PointerEvent): void =>
        handlePointerUp(canvas, event, dispatch, viewport, draftRef, startRef, attachTargetIdRef);

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);

      return (): void => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
      };
    }
  }, [activeTool, canvasRef, dispatch, draftRef, refs, setClassName, viewport]);
};
