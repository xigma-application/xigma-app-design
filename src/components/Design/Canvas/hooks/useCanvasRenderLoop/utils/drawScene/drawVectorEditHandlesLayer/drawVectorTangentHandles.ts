// others
import { VECTOR_HANDLE_FILL, VECTOR_HANDLE_SIZE } from 'constant/canvas';

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';
import { drawLine } from 'utils/canvas/drawLine';
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';

export const drawVectorTangentHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const handleSize = VECTOR_HANDLE_SIZE / viewport.zoom;

  Object.values(node.segments).forEach((segment) => {
    const start = node.vertices[segment.startId];
    const end = node.vertices[segment.endId];
    const handleStart = getVectorHandlePosition(start, segment.tangentStart);
    const handleEnd = getVectorHandlePosition(end, segment.tangentEnd);

    [
      { handle: handleStart, vertex: start },
      { handle: handleEnd, vertex: end },
    ].forEach(({ handle, vertex }) => {
      if (handle) {
        drawLine(
          gl,
          program,
          buffer,
          { x1: vertex.x, x2: handle.x, y1: vertex.y, y2: handle.y },
          VECTOR_HANDLE_FILL,
          1 / viewport.zoom,
          canvasWidth,
          canvasHeight,
          viewport,
        );
        drawEllipse(
          gl,
          program,
          buffer,
          { fill: VECTOR_HANDLE_FILL, height: handleSize, width: handleSize, x: handle.x - handleSize / 2, y: handle.y - handleSize / 2 },
          canvasWidth,
          canvasHeight,
          viewport,
          0,
        );
      }
    });
  });
};
