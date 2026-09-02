// store
import { selectAllGuideLines, selectAreRulersVisible, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TRulerMenu, TSelectedGuide } from '../types';

// utils
import { getGuideAtPoint } from './getGuideAtPoint';
import { getPointerPosition } from '../../../utils/getPointerPosition';
import { getRulerGutterSide } from './getRulerGutterSide';

export const handleContextMenu = (
  canvas: HTMLCanvasElement,
  event: MouseEvent,
  refs: TCanvasRefs,
  openMenuAt: (point: TPoint) => void,
  setRulerMenu: (menu: TRulerMenu | null) => void,
  setSelectedGuide: (selected: TSelectedGuide | null) => void,
): void => {
  const pointer = getPointerPosition(canvas, event);
  const state = store.getState();
  const gutterSide = getRulerGutterSide(pointer, selectAreRulersVisible(state), refs.layout.leftPanelWidthRef.current);

  if (gutterSide) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedGuide(null);
    setRulerMenu({ axis: gutterSide === 'top' ? 'x' : 'y' });
    openMenuAt({ x: event.clientX, y: event.clientY });
    return;
  }

  const hit = getGuideAtPoint(pointer, selectAllGuideLines(state), selectViewport(state));

  if (hit) {
    event.preventDefault();
    event.stopPropagation();
    setRulerMenu(null);
    setSelectedGuide({ frameId: hit.frameId, id: hit.id });
    openMenuAt({ x: event.clientX, y: event.clientY });
  }
};
