// others
import { HOVER_OUTLINE_WIDTH, VECTOR_CUT_LINE_STROKE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorCutSegmentHover } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { drawVectorCutPointMarker } from './drawVectorCutPointMarker';
import { drawVectorStroke } from 'utils/canvas/drawVectorNode/drawVectorStroke';
import { flattenVectorSegments } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';

export const drawVectorCutHoverPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  hoveredSegment: TVectorCutSegmentHover | null,
  hoveredPoint: TPoint | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const node = hoveredSegment ? getVectorEditingNode(nodes, hoveredSegment.nodeId) : null;

  if (node && hoveredSegment) {
    const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
    const segment = flattenVectorSegments(bakedNode).find((candidate) => candidate.segmentId === hoveredSegment.segmentId);

    if (segment) {
      drawVectorStroke(gl, program, buffer, [segment], VECTOR_CUT_LINE_STROKE, HOVER_OUTLINE_WIDTH / viewport.zoom, canvasWidth, canvasHeight, viewport);
    }
  }

  if (hoveredPoint) {
    drawVectorCutPointMarker(gl, program, buffer, hoveredPoint, canvasWidth, canvasHeight, viewport);
  }
};
