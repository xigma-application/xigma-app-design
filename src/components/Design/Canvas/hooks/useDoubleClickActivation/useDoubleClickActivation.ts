import { useEffect } from 'react';

// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { RootState, store, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../utils/getPointerPosition';
import { screenToWorld } from '../../utils/screenToWorld';

export const useDoubleClickActivation = <TTarget>(
  refs: TCanvasRefs,
  isBlocked: boolean,
  getTarget: (point: TPoint, state: RootState) => TTarget | null,
  onHit: (target: TTarget) => void,
): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);

  const handleDoubleClick = (canvas: HTMLCanvasElement, event: MouseEvent): void => {
    const state = store.getState();
    const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
    const target = getTarget(point, state);

    if (target) {
      event.preventDefault();
      event.stopPropagation();
      onHit(target);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.default && !isBlocked) {
      const onDoubleClick = (event: MouseEvent): void => handleDoubleClick(canvas, event);
      canvas.addEventListener('dblclick', onDoubleClick);

      return (): void => canvas.removeEventListener('dblclick', onDoubleClick);
    }
  }, [activeTool, canvasRef, isBlocked]);
};
