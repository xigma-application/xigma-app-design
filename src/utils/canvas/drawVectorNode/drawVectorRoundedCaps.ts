// others
import { PENCIL_CAP_RADIUS_PX } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawEllipse } from '../shapes/drawEllipse';
import { getOpenVectorEndpoints } from '../vectorNetwork/getOpenVectorEndpoints';

export const drawVectorRoundedCaps = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node.capStyle === 'round') {
    getOpenVectorEndpoints(node).forEach((vertexId) => {
      const vertex = node.vertices[vertexId];

      drawEllipse(
        gl,
        program,
        buffer,
        {
          fill: node.strokeColor,
          height: PENCIL_CAP_RADIUS_PX * 2,
          width: PENCIL_CAP_RADIUS_PX * 2,
          x: vertex.x - PENCIL_CAP_RADIUS_PX,
          y: vertex.y - PENCIL_CAP_RADIUS_PX,
        },
        canvasWidth,
        canvasHeight,
        viewport,
        0,
      );
    });
  }
};
