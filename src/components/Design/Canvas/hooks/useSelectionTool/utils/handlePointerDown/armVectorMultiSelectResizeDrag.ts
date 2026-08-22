import { RefObject } from 'react';

// types
import { TDraftRect, TResizeHandle } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getResizeAxisAnchors } from '../../../../utils/getResizeAxisAnchors';
import { getVectorMultiSelectOrigins } from './getVectorMultiSelectOrigins';
import { getVectorMultiSelectResizeAnchorWorld } from '../../../../utils/getVectorMultiSelectResizeTransform';

export const armVectorMultiSelectResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorMultiSelectResizeDragRef: RefObject<TVectorMultiSelectResizeDragState | null>,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  selectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  bounds: TDraftRect,
  rotation: number,
  handle: TResizeHandle,
): void => {
  const { handleOrigins, vertexOrigins } = getVectorMultiSelectOrigins(nodes, vectorEditingNodeIds, selectedVertexIds, selectedHandles);
  const anchor = getResizeAxisAnchors(handle, bounds);
  const anchorWorld = getVectorMultiSelectResizeAnchorWorld(bounds, anchor, rotation);

  vectorMultiSelectResizeDragRef.current = {
    anchor,
    anchorWorld,
    bounds,
    handle,
    handleOrigins,
    liveBounds: bounds,
    rotation,
    vertexOrigins,
  };
  canvas.setPointerCapture(event.pointerId);
};
