// others
import { DRAFT_FRAME_STROKE, VECTOR_CURVE_SEGMENTS, VECTOR_STROKE_WIDTH, VECTOR_VERTEX_FILL, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPenPreview } from 'types/design/canvas/types';
import { TSceneNode, TViewport } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenSegment } from 'utils/canvas/vectorNetwork/flattenSegment';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { rotatePoint } from 'utils/math/rotatePoint';

const ORIGIN: TPoint = { x: 0, y: 0 };

const drawVertexPreviewDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  point: TPoint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const vertexSize = VECTOR_VERTEX_SIZE / viewport.zoom;

  drawEllipse(
    gl,
    program,
    buffer,
    {
      fill: VECTOR_VERTEX_FILL,
      height: vertexSize,
      stroke: DRAFT_FRAME_STROKE,
      width: vertexSize,
      x: point.x - vertexSize / 2,
      y: point.y - vertexSize / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};

export const drawPenPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  preview: TPenPreview | null,
  newVertexPreview: TPoint | null,
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
    const from = rotatePoint(preview.from, pivot, rotation);
    const to = rotatePoint(preview.to, pivot, rotation);
    const tangentFromOffset = preview.tangentFromOffset ? rotatePoint(preview.tangentFromOffset, ORIGIN, rotation) : null;
    const points = flattenSegment(from, to, tangentFromOffset, null, VECTOR_CURVE_SEGMENTS);

    drawVectorStroke(
      gl,
      program,
      buffer,
      [{ points, segmentId: 'preview' }],
      DRAFT_FRAME_STROKE,
      VECTOR_STROKE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawVertexPreviewDot(gl, program, buffer, to, canvasWidth, canvasHeight, viewport);
  }

  if (newVertexPreview) {
    drawVertexPreviewDot(gl, program, buffer, newVertexPreview, canvasWidth, canvasHeight, viewport);
  }
};
