// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_SIZE } from '../../../constants';

// store
import { selectEditingTextBox, selectEditingTextContent, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { getPointerPosition } from '../../../utils/getPointerPosition';
import { getStraightCaretIndexAtPoint, TStraightCaretHit } from 'utils/canvas/text/getStraightCaretIndexAtPoint';
import { screenToWorld } from '../../../utils/screenToWorld';

export const getStraightHitAtEvent = (canvas: HTMLCanvasElement, event: MouseEvent): TStraightCaretHit | null => {
  const state = store.getState();
  const box = selectEditingTextBox(state);

  if (!box || box.pathId) {
    return null;
  }

  const viewport = selectViewport(state);
  const content = selectEditingTextContent(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);

  return getStraightCaretIndexAtPoint(MSDF_ATLAS_JSON, content, TEXT_FONT_SIZE, box, point);
};
