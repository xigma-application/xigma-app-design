import { RefObject } from 'react';

// store
import { selectOrderedNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

// utils
import { getNodeAtPoint } from '../../../../utils/getNodeAtPoint';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { resolveToolHover } from './resolveToolHover';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { setHoverState } from '../setHoverState';

export const resolveHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  hoverRef: RefObject<string | null>,
  setClassName: (className: string | null) => void,
  activeTool: ToolName,
): void => {
  const state = store.getState();
  const viewport = selectViewport(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);
  const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);

  if (activeTool === ToolName.comment) {
    setHoverState(canvas, hoverRef, setClassName, 'comment', '', hit?.id ?? null);
  } else {
    resolveToolHover(canvas, hoverRef, setClassName, activeTool, point, viewport, state);
  }
};
