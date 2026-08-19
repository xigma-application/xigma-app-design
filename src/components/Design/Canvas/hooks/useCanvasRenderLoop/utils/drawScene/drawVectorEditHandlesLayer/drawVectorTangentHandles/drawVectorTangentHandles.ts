// others
import { VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawTangentHandle } from './drawTangentHandle';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';

export const drawVectorTangentHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  hoveredHandle: TVectorHandleHover | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const dotSize = VECTOR_VERTEX_SIZE / viewport.zoom;

  Object.values(node.segments).forEach((segment) => {
    const start = node.vertices[segment.startId];
    const end = node.vertices[segment.endId];
    const handleStart = getVectorHandlePosition(start, getEffectiveTangentStart(node.vertices, segment));
    const handleEnd = getVectorHandlePosition(end, segment.tangentEnd);
    const isStartHovered = hoveredHandle?.segmentId === segment.id && hoveredHandle.end === 'start';
    const isEndHovered = hoveredHandle?.segmentId === segment.id && hoveredHandle.end === 'end';

    if (handleStart) {
      drawTangentHandle(gl, program, buffer, start, handleStart, dotSize, isStartHovered, canvasWidth, canvasHeight, viewport);
    }

    if (handleEnd) {
      drawTangentHandle(gl, program, buffer, end, handleEnd, dotSize, isEndHovered, canvasWidth, canvasHeight, viewport);
    }
  });
};
