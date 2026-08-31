// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { drawPenSegmentPreview } from './drawPenSegmentPreview';
import { drawVertexPreviewDot } from './drawVertexPreviewDot';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const drawPenPreview = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeId: string | null,
): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const preview = refs.pen.penPreviewRef.current;
  const newVertexPreview = refs.pen.penNewVertexPreviewRef.current;
  const isDragArmable = refs.pen.penHoveredDragArmableVertexRef.current;
  const editingNode = getVectorEditingNode(nodes, vectorEditingNodeId);
  const rotation = editingNode?.rotation ?? 0;
  const bounds = editingNode ? getVectorNodeBounds(editingNode) : null;
  const pivot = bounds ? { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 } : ORIGIN;

  if (preview) {
    drawPenSegmentPreview(gl, program, buffer, preview, isDragArmable, pivot, rotation, canvasWidth, canvasHeight, viewport);
  }

  if (newVertexPreview) {
    drawVertexPreviewDot(gl, program, buffer, newVertexPreview, isDragArmable, canvasWidth, canvasHeight, viewport);
  }
};
