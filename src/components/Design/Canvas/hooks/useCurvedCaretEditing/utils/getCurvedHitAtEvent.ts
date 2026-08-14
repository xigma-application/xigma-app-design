// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_SIZE } from '../../../constants';

// store
import { selectEditingTextBox, selectEditingTextContent, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { getCurvedCaretIndexAtPoint, TCurvedCaretHit } from 'utils/canvas/text/getCurvedCaretIndexAtPoint';
import { getPointerPosition } from '../../../utils/getPointerPosition';
import { screenToWorld } from '../../../utils/screenToWorld';

export const getCurvedHitAtEvent = (canvas: HTMLCanvasElement, event: PointerEvent): TCurvedCaretHit | null => {
  const state = store.getState();
  const box = selectEditingTextBox(state);

  if (!box?.pathId) {
    return null;
  }

  const viewport = selectViewport(state);
  const content = selectEditingTextContent(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);

  return getCurvedCaretIndexAtPoint(MSDF_ATLAS_JSON, content, TEXT_FONT_SIZE, box, point);
};
