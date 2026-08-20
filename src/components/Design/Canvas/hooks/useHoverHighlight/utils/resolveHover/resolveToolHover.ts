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
  selectVectorEditingNodeId,
} from 'store/design/selectors';
import { RootState } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { THoverResolverContext } from './types';
import { TViewport } from 'types/design/types';

// utils
import { getResizeHandleAtPoint } from '../../../../utils/getResizeHandleAtPoint/getResizeHandleAtPoint';
import { setHoverState } from '../setHoverState';

export const resolveToolHover = (
  canvas: HTMLCanvasElement,
  hoverRef: RefObject<string | null>,
  setClassName: (className: string | null) => void,
  activeTool: ToolName,
  point: TPoint,
  viewport: TViewport,
  state: RootState,
): void => {
  const editingTextBox = selectEditingTextBox(state);
  const isEditingText = Boolean(editingTextBox);
  const isEditingVector = Boolean(selectVectorEditingNodeId(state));
  const selectedNodes = selectSelectedNodes(state);
  const resizableSelectedNodes = isEditingText || isEditingVector ? [] : selectedNodes;
  const applyClassName = isEditingVector ? (): void => {} : setClassName;
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
      return setHoverState(canvas, hoverRef, applyClassName, result.className, result.cursor, result.nodeId);
    }
  }
};
