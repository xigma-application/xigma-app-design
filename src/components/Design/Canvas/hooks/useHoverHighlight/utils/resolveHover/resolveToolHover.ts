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
  selectVectorEditingNodeIds,
} from 'store/design/selectors';
import { RootState } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { THoverResolverContext } from './types';
import { TViewport } from 'types/design/types';

// utils
import { getResizeHandleAtPoint } from '../../../../utils/getResizeHandleAtPoint/getResizeHandleAtPoint';
import { getVectorMultiSelectBoxForHover } from './getVectorMultiSelectBoxForHover';
import { getVectorMultiSelectResizeHandle } from '../../../../utils/getVectorMultiSelectResizeHandle';
import { setHoverState } from '../setHoverState';

export const resolveToolHover = (
  canvas: HTMLCanvasElement,
  hoverRef: RefObject<string | null>,
  setClassName: (className: string | null) => void,
  activeTool: ToolName,
  point: TPoint,
  viewport: TViewport,
  state: RootState,
  refs: TCanvasRefs,
): void => {
  const editingTextBox = selectEditingTextBox(state);
  const isEditingText = Boolean(editingTextBox);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const isEditingVector = vectorEditingNodeIds.length > 0;
  const selectedNodes = selectSelectedNodes(state);
  const resizableSelectedNodes = isEditingText || isEditingVector ? [] : selectedNodes;
  const applyClassName = isEditingVector ? (): void => {} : setClassName;
  const selectedVertexIds = refs.vectorEdit.selectedVectorVertexIdsRef.current;
  const selectedHandles = refs.vectorEdit.selectedVectorHandlesRef.current;
  const vectorMultiSelectBox = getVectorMultiSelectBoxForHover(
    state.design.pages[state.design.activePageId].nodes,
    vectorEditingNodeIds,
    selectedVertexIds,
    selectedHandles,
    refs.vectorMultiSelect.vectorMultiSelectBoxRef,
    refs.vectorEdit.selectedVectorSegmentIdsRef.current,
  );
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
    vectorMultiSelectBox,
    vectorMultiSelectResizeHandle:
      vectorMultiSelectBox && getVectorMultiSelectResizeHandle(point, vectorMultiSelectBox.bounds, viewport, vectorMultiSelectBox.rotation),
    viewport,
  };

  for (const resolve of HOVER_RESOLVERS) {
    const result = resolve(ctx);

    if (result) {
      return setHoverState(canvas, hoverRef, applyClassName, result.className, result.cursor, result.nodeId);
    }
  }
};
