// store
import { selectAllGuideLines, selectAreRulersVisible, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getGuideAtPoint } from './getGuideAtPoint';
import { getGutterAxis } from './getGutterAxis';
import { getPointerPosition } from '../../../utils/getPointerPosition';
import { screenToWorld } from '../../../utils/screenToWorld';

const CURSOR_BY_AXIS = { x: 'col-resize', y: 'row-resize' } as const;

export const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent, refs: TCanvasRefs): void => {
  const pointer = getPointerPosition(canvas, event);
  const state = store.getState();
  const viewport = selectViewport(state);
  const dragging = refs.guides.draggingGuideRef.current;

  if (dragging) {
    const worldPoint = screenToWorld(pointer, viewport);

    dragging.position = dragging.axis === 'x' ? worldPoint.x : worldPoint.y;
    canvas.style.cursor = CURSOR_BY_AXIS[dragging.axis];
    event.stopImmediatePropagation();
    return;
  }

  const gutterAxis = getGutterAxis(pointer, selectAreRulersVisible(state));

  if (gutterAxis) {
    canvas.style.cursor = CURSOR_BY_AXIS[gutterAxis];
    event.stopImmediatePropagation();
    return;
  }

  const hitGuide = getGuideAtPoint(pointer, selectAllGuideLines(state), viewport);

  if (hitGuide) {
    canvas.style.cursor = CURSOR_BY_AXIS[hitGuide.axis];
    event.stopImmediatePropagation();
  }
};
