import { RefObject } from 'react';

// others
import { HANDLE_HOVER_RESOLVERS, HOVER_RESOLVERS } from './constants';

// store
import {
  selectEditingNodeId,
  selectEditingTextBox,
  selectEditingTextContent,
  selectGradientEditor,
  selectImageEditor,
  selectOpenPropertyPanel,
  selectNodes,
  selectSelectedNodes,
  selectSmartSelectionNodes,
  selectVectorEditingNodeIds,
} from 'store/design/selectors';
import { RootState } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { THoverResolverContext } from './types';
import { TViewport } from 'types/design/types';

// utils
import { getHoverLeafNodes } from './getHoverLeafNodes';
import { getResizeHandleAtPoint } from '../../../../utils/getResizeHandleAtPoint/getResizeHandleAtPoint';
import { getSelectionGroupHit } from '../../../../utils/getSelectionGroupHit';
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
  isControlPressed: boolean,
): void => {
  const editingTextBox = selectEditingTextBox(state);
  const isEditingText = Boolean(editingTextBox);
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const isEditingVector = vectorEditingNodeIds.length > 0;
  const nodesById = selectNodes(state);
  const selectedNodes = selectSelectedNodes(state);
  const resizableSelectedNodes = isEditingText || isEditingVector ? [] : selectedNodes;
  const applyClassName = isEditingVector ? (): void => {} : setClassName;
  const vectorMultiSelectBox = getVectorMultiSelectBoxForHover(state, refs);

  const ctx: THoverResolverContext = {
    activeTool,
    editingContent: selectEditingTextContent(state),
    editingNodeId: selectEditingNodeId(state),
    editingTextBox,
    gradientEditor: selectGradientEditor(state),
    imageEditor: selectImageEditor(state),
    isControlPressed,
    leafNodes: getHoverLeafNodes(state, nodesById, isControlPressed),
    nodesById,
    openPropertyPanel: selectOpenPropertyPanel(state),
    point,
    refs,
    resizableSelectedNodes,
    resizeHandleHit: getSelectionGroupHit(resizableSelectedNodes, (group) => getResizeHandleAtPoint(point, group, viewport)),
    selectedNodes,
    smartSelectionNodes: selectSmartSelectionNodes(state),
    vectorMultiSelectBox,
    vectorMultiSelectResizeHandle:
      vectorMultiSelectBox && getVectorMultiSelectResizeHandle(point, vectorMultiSelectBox.bounds, viewport, vectorMultiSelectBox.rotation),
    viewport,
  };

  const handleResults = new Map(HANDLE_HOVER_RESOLVERS.map((resolve) => [resolve, resolve(ctx)]));

  for (const resolve of HOVER_RESOLVERS) {
    const result = handleResults.has(resolve) ? handleResults.get(resolve) : resolve(ctx);

    if (result) {
      return setHoverState(canvas, hoverRef, applyClassName, result.className, result.cursor, result.nodeId);
    }
  }
};
