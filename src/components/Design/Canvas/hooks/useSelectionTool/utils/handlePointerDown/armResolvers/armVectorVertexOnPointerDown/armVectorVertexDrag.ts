import { RefObject } from 'react';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

export const armVectorVertexDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorVertexDragRef: RefObject<TVectorVertexDragState | null>,
  node: TVectorNode,
  vertexId: string,
  point: TPoint,
): void => {
  const vertex = node.vertices[vertexId];

  vectorVertexDragRef.current = { nodeId: node.id, origins: { [vertexId]: { x: vertex.x, y: vertex.y } }, pointerStart: point };
  canvas.setPointerCapture(event.pointerId);
};
