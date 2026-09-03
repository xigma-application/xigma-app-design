import { RefObject } from 'react';

// others
import { HOVER_RESOLVERS } from './constants';

// store
import {
  selectEditingNodeId,
  selectEditingTextBox,
  selectEditingTextContent,
  selectNodes,
  selectRenderOrderedNodes,
  selectSelectedNodes,
  selectVectorEditingNodeIds,
} from 'store/design/selectors';
import { RootState } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { THoverResolverContext } from './types';
import { TViewport } from 'types/design/types';

// utils
import { getResizeHandleAtPoint } from '../../../../utils/getResizeHandleAtPoint/getResizeHandleAtPoint';
import { getVectorMultiSelectBoxForHover } from './getVectorMultiSelectBoxForHover';
import { getVectorMultiSelectResizeHandle } from '../../../../utils/getVectorMultiSelectResizeHandle';
import { resolveCornerRadiusHandleHover } from './resolveCornerRadiusHandleHover';
import { resolveEllipseArcHandleHover } from './resolveEllipseArcHandleHover';
import { resolveEllipseArcRatioHandleHover } from './resolveEllipseArcRatioHandleHover';
import { resolveEllipseArcRotateHandleHover } from './resolveEllipseArcRotateHandleHover';
import { resolvePolygonCornerRadiusHandleHover } from './resolvePolygonCornerRadiusHandleHover';
import { resolvePolygonVertexCountHandleHover } from './resolvePolygonVertexCountHandleHover';
import { resolveStarCornerRadiusHandleHover } from './resolveStarCornerRadiusHandleHover';
import { resolveStarRatioHandleHover } from './resolveStarRatioHandleHover';
import { resolveStarVertexCountHandleHover } from './resolveStarVertexCountHandleHover';
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
  isControlPressed: boolean,
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
    isControlPressed,
    leafNodes: selectRenderOrderedNodes(state).filter((node) => node.type !== NodeType.group),
    nodesById: selectNodes(state),
    point,
    refs,
    resizableSelectedNodes,
    resizeHandleHit: getResizeHandleAtPoint(point, resizableSelectedNodes, viewport),
    selectedNodes,
    vectorMultiSelectBox,
    vectorMultiSelectResizeHandle:
      vectorMultiSelectBox && getVectorMultiSelectResizeHandle(point, vectorMultiSelectBox.bounds, viewport, vectorMultiSelectBox.rotation),
    viewport,
  };

  resolveEllipseArcHandleHover(point, resizableSelectedNodes, viewport, refs);
  resolveEllipseArcRotateHandleHover(point, resizableSelectedNodes, viewport, refs);
  resolveEllipseArcRatioHandleHover(point, resizableSelectedNodes, viewport, refs);
  resolveCornerRadiusHandleHover(point, resizableSelectedNodes, viewport, refs);
  resolvePolygonCornerRadiusHandleHover(point, resizableSelectedNodes, viewport, refs);
  resolvePolygonVertexCountHandleHover(point, resizableSelectedNodes, viewport, refs);
  resolveStarCornerRadiusHandleHover(point, resizableSelectedNodes, viewport, refs);
  resolveStarRatioHandleHover(point, resizableSelectedNodes, viewport, refs);
  resolveStarVertexCountHandleHover(point, resizableSelectedNodes, viewport, refs);

  for (const resolve of HOVER_RESOLVERS) {
    const result = resolve(ctx);

    if (result) {
      return setHoverState(canvas, hoverRef, applyClassName, result.className, result.cursor, result.nodeId);
    }
  }
};
