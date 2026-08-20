import { RefObject } from 'react';

// types
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getResizeAxisAnchors } from '../../../../utils/getResizeAxisAnchors';
import { getVectorMultiSelectOrigins } from './getVectorMultiSelectOrigins';
import { getVectorMultiSelectResizeAnchorWorld } from '../../../../utils/getVectorMultiSelectResizeTransform';

export const armVectorMultiSelectResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorMultiSelectResizeDragRef: RefObject<TVectorMultiSelectResizeDragState | null>,
  node: TVectorNode,
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  bounds: TDraftRect,
  rotation: number,
  handle: TResizeHandle,
): void => {
  const { handleOrigins, vertexOrigins } = getVectorMultiSelectOrigins(node, selectedVertexIds, selectedHandles);
  const anchor = getResizeAxisAnchors(handle, bounds);
  const anchorWorld = getVectorMultiSelectResizeAnchorWorld(bounds, anchor, rotation);

  vectorMultiSelectResizeDragRef.current = {
    anchor,
    anchorWorld,
    bounds,
    handle,
    handleOrigins,
    liveBounds: bounds,
    nodeId: node.id,
    rotation,
    vertexOrigins,
  };
  canvas.setPointerCapture(event.pointerId);
};
