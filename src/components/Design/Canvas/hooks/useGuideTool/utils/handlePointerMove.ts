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

const CLASS_NAME_BY_AXIS = { x: 'resize-x', y: 'resize-y' } as const;

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  refs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  const pointer = getPointerPosition(canvas, event);
  const state = store.getState();
  const viewport = selectViewport(state);
  const dragging = refs.guides.draggingGuideRef.current;

  if (dragging) {
    const worldPoint = screenToWorld(pointer, viewport);

    dragging.position = dragging.axis === 'x' ? worldPoint.x : worldPoint.y;
    dragging.hasMoved = true;
    setClassName(CLASS_NAME_BY_AXIS[dragging.axis]);
    event.stopImmediatePropagation();
    return;
  }

  const gutterAxis = getGutterAxis(pointer, selectAreRulersVisible(state), refs.layout.leftPanelWidthRef.current);

  if (gutterAxis) {
    setClassName(CLASS_NAME_BY_AXIS[gutterAxis]);
    event.stopImmediatePropagation();
    return;
  }

  const hitGuide = getGuideAtPoint(pointer, selectAllGuideLines(state), viewport);

  if (hitGuide) {
    setClassName(CLASS_NAME_BY_AXIS[hitGuide.axis]);
    event.stopImmediatePropagation();
  }
};
