// types
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode, TVectorSegment, TViewport } from 'types/design/types';

// utils
import { drawTangentHandle } from './drawTangentHandle';
import { getEffectiveTangentEnd } from 'utils/canvas/vectorNetwork/getEffectiveTangentEnd';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';
import { isVectorSegmentEndpointSelected } from 'utils/canvas/vectorNetwork/isVectorSegmentEndpointSelected';

const isHandleSelected = (selectedHandles: TVectorHandleHover[], segmentId: string, end: 'end' | 'start'): boolean =>
  selectedHandles.some((selected) => selected.segmentId === segmentId && selected.end === end);

const isHandleSnapped = (snappedHandle: TVectorHandleHover | null, segmentId: string, end: 'end' | 'start'): boolean =>
  snappedHandle?.segmentId === segmentId && snappedHandle.end === end;

export const drawSegmentTangentHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  segment: TVectorSegment,
  hoveredHandle: TVectorHandleHover | null,
  selectedHandles: TVectorHandleHover[],
  snappedHandle: TVectorHandleHover | null,
  selectedVertexIds: ReadonlySet<string>,
  oneHopVertexIds: ReadonlySet<string>,
  selectedSegmentIds: ReadonlySet<string>,
  dotSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];
  const handleStart = getVectorHandlePosition(start, getEffectiveTangentStart(node.vertices, segment));
  const handleEnd = getVectorHandlePosition(end, getEffectiveTangentEnd(node.vertices, segment));
  const isStartHovered = hoveredHandle?.segmentId === segment.id && hoveredHandle.end === 'start';
  const isEndHovered = hoveredHandle?.segmentId === segment.id && hoveredHandle.end === 'end';
  const isStartSelected = isHandleSelected(selectedHandles, segment.id, 'start');
  const isEndSelected = isHandleSelected(selectedHandles, segment.id, 'end');
  const isVertexSelected = isVectorSegmentEndpointSelected(segment.startId, segment.endId, selectedVertexIds);
  const isSegmentDirectlyTouchingSelection = isVertexSelected || selectedSegmentIds.has(segment.id);
  const isStartVisible = isSegmentDirectlyTouchingSelection || oneHopVertexIds.has(segment.startId) || isStartSelected;
  const isEndVisible = isSegmentDirectlyTouchingSelection || oneHopVertexIds.has(segment.endId) || isEndSelected;

  if (handleStart && isStartVisible) {
    drawTangentHandle(
      gl,
      program,
      buffer,
      start,
      handleStart,
      dotSize,
      isStartHovered,
      isStartSelected,
      isHandleSnapped(snappedHandle, segment.id, 'start'),
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }

  if (handleEnd && isEndVisible) {
    drawTangentHandle(
      gl,
      program,
      buffer,
      end,
      handleEnd,
      dotSize,
      isEndHovered,
      isEndSelected,
      isHandleSnapped(snappedHandle, segment.id, 'end'),
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};
