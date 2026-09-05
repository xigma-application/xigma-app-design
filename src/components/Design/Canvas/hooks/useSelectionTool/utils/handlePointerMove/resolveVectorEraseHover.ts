// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const resolveVectorEraseHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const state = store.getState();

  if (selectActiveTool(state) === ToolName.erase) {
    setClassName('erase');
    canvasRefs.vectorErase.eraseBrushCenterRef.current = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
  } else {
    canvasRefs.vectorErase.eraseBrushCenterRef.current = null;
  }
};
