// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode, TVectorSegment, TViewport } from 'types/design/types';

// utils
import { drawTangentHandle } from './drawTangentHandle';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';

const isHandleSelected = (selectedHandles: TVectorHandleHover[], segmentId: string, end: 'end' | 'start'): boolean =>
  selectedHandles.some((selected) => selected.segmentId === segmentId && selected.end === end);

export const drawSegmentTangentHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  segment: TVectorSegment,
  hoveredHandle: TVectorHandleHover | null,
  selectedHandles: TVectorHandleHover[],
  dotSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];
  const handleStart = getVectorHandlePosition(start, getEffectiveTangentStart(node.vertices, segment));
  const handleEnd = getVectorHandlePosition(end, segment.tangentEnd);
  const isStartHovered = hoveredHandle?.segmentId === segment.id && hoveredHandle.end === 'start';
  const isEndHovered = hoveredHandle?.segmentId === segment.id && hoveredHandle.end === 'end';
  const isStartSelected = isHandleSelected(selectedHandles, segment.id, 'start');
  const isEndSelected = isHandleSelected(selectedHandles, segment.id, 'end');

  if (handleStart) {
    drawTangentHandle(
      gl,
      program,
      buffer,
      start,
      handleStart,
      dotSize,
      isStartHovered,
      isStartSelected,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }

  if (handleEnd) {
    drawTangentHandle(gl, program, buffer, end, handleEnd, dotSize, isEndHovered, isEndSelected, canvasWidth, canvasHeight, viewport);
  }
};
