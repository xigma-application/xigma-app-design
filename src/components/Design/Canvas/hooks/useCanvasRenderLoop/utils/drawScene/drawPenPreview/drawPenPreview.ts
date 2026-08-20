// types
import { TPenPreview } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { drawPenSegmentPreview } from './drawPenSegmentPreview';
import { drawVertexPreviewDot } from './drawVertexPreviewDot';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';

const ORIGIN: TPoint = { x: 0, y: 0 };

export const drawPenPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  preview: TPenPreview | null,
  newVertexPreview: TPoint | null,
  isDragArmable: boolean,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeId: string | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
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
