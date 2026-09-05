// store
import { selectActivePage, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorWidthLabelEdit } from './types';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { getWidthLabelEditAtPoint } from './getWidthLabelEditAtPoint';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const handleDoubleClick = (
  canvas: HTMLCanvasElement,
  event: MouseEvent,
  refs: TCanvasRefs,
  setEdit: (edit: TVectorWidthLabelEdit) => void,
): void => {
  const state = store.getState();
  const viewport = selectViewport(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);
  const nodes = selectActivePage(state).nodes;
  const edit = getWidthLabelEditAtPoint(point, refs, nodes, viewport.zoom);

  if (edit) {
    event.preventDefault();
    event.stopPropagation();
    setEdit(edit);
  }
};
