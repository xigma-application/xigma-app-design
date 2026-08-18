import { RefObject } from 'react';

// others
import { HOVER_RESOLVERS } from './constants';

// store
import {
  selectEditingNodeId,
  selectEditingTextBox,
  selectEditingTextContent,
  selectOrderedNodes,
  selectSelectedNodes,
  selectViewport,
} from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { THoverResolverContext } from './types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getResizeHandleAtPoint } from '../../../../utils/getResizeHandleAtPoint';
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
  const editingTextBox = selectEditingTextBox(state);
  const isEditingText = Boolean(editingTextBox);
  const selectedNodes = selectSelectedNodes(state);
  const resizableSelectedNodes = isEditingText ? [] : selectedNodes;
  const ctx: THoverResolverContext = {
    activeTool,
    editingContent: selectEditingTextContent(state),
    editingNodeId: selectEditingNodeId(state),
    editingTextBox,
    orderedNodes: selectOrderedNodes(state),
    point,
    resizableSelectedNodes,
    resizeHandleHit: getResizeHandleAtPoint(point, resizableSelectedNodes, viewport),
    selectedNodes,
    viewport,
  };

  for (const resolve of HOVER_RESOLVERS) {
    const result = resolve(ctx);

    if (result) {
      return setHoverState(canvas, hoverRef, setClassName, result.className, result.cursor, result.nodeId);
    }
  }
};
