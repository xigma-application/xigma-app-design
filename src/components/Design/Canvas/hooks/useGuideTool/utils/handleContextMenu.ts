// store
import { selectAllGuideLines, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TSelectedGuide } from '../types';

// utils
import { getGuideAtPoint } from './getGuideAtPoint';
import { getPointerPosition } from '../../../utils/getPointerPosition';
import { screenToWorld } from '../../../utils/screenToWorld';

export const handleContextMenu = (
  canvas: HTMLCanvasElement,
  event: MouseEvent,
  setSelectedGuide: (selected: TSelectedGuide | null) => void,
): void => {
  const pointer = getPointerPosition(canvas, event);
  const state = store.getState();
  const viewport = selectViewport(state);
  const hit = getGuideAtPoint(pointer, selectAllGuideLines(state), viewport);

  if (hit) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedGuide({ frameId: hit.frameId, id: hit.id, worldPoint: screenToWorld(pointer, viewport) });
  }
};
