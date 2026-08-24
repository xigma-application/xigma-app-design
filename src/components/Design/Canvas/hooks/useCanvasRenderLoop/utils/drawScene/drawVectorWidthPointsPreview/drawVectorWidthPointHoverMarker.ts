// types
import { TSceneNode, TViewport } from 'types/design/types';
import { TVectorWidthPointHover } from 'types/design/canvas/types';

// utils
import { bakeVectorNodeRotation } from 'components/Design/Canvas/utils/bakeVectorNodeRotation';
import { drawVectorCutPointMarker } from '../drawVectorCutPointMarker';
import { getVectorEditingNode } from 'components/Design/Canvas/utils/getVectorEditingNode';
import { getVectorSegmentPointAtT } from 'utils/canvas/vectorNetwork/getVectorSegmentPointAtT';

export const drawVectorWidthPointHoverMarker = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  nodes: Record<string, TSceneNode>,
  hoveredWidthPoint: TVectorWidthPointHover | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (hoveredWidthPoint) {
    const node = getVectorEditingNode(nodes, hoveredWidthPoint.nodeId);

    if (node) {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const point = getVectorSegmentPointAtT(bakedNode, bakedNode.segments[hoveredWidthPoint.segmentId], hoveredWidthPoint.t);

      drawVectorCutPointMarker(gl, program, buffer, point, canvasWidth, canvasHeight, viewport);
    }
  }
};
