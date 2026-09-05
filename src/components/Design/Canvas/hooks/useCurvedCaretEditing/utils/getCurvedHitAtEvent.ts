// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_SIZE } from '../../../constants';

// store
import { selectEditingTextBox, selectEditingTextContent, selectNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { getCurvedCaretIndexAtPoint, TCurvedCaretHit } from 'utils/canvas/text/getCurvedCaretIndexAtPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const getCurvedHitAtEvent = (canvas: HTMLCanvasElement, event: MouseEvent): TCurvedCaretHit | null => {
  const state = store.getState();
  const box = selectEditingTextBox(state);

  if (!box?.pathId) {
    return null;
  }

  const viewport = selectViewport(state);
  const content = selectEditingTextContent(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);
  const pathNode = selectNodes(state)[box.pathId];

  return getCurvedCaretIndexAtPoint(MSDF_ATLAS_JSON, content, TEXT_FONT_SIZE, box, point, pathNode);
};
