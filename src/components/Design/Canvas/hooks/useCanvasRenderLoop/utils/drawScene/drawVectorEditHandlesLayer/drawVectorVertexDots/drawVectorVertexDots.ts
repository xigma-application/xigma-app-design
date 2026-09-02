// others
import {
  DISTANCE_GUIDE_STROKE,
  VECTOR_VERTEX_FILL,
  VECTOR_VERTEX_SELECTED_FILL,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
  VECTOR_VERTEX_SIZE,
} from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';
import { TVertexDotBufferCacheEntry } from './types';

// utils
import { collectVertexDotBuckets } from './collectVertexDotBuckets';
import { drawVectorVertexDotBatch } from './drawVectorVertexDotBatch';

export const drawVectorVertexDots = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertexDotBufferCache: WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>,
  node: TVectorNode,
  selectedVertexIds: string[],
  hoveredVertexId: string | null,
  newVertexIds: Set<string>,
  isMeasuring: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const baseSize = VECTOR_VERTEX_SIZE / viewport.zoom;
  const selected = new Set(selectedVertexIds);
  const { plainVertexCenters, selectedVertexCenters } = collectVertexDotBuckets(
    gl,
    program,
    buffer,
    node,
    selected,
    newVertexIds,
    hoveredVertexId,
    isMeasuring,
    baseSize,
    canvasWidth,
    canvasHeight,
    viewport,
  );

  drawVectorVertexDotBatch(
    gl,
    program,
    buffer,
    vertexDotBufferCache,
    plainVertexCenters,
    baseSize,
    VECTOR_VERTEX_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawVectorVertexDotBatch(
    gl,
    program,
    buffer,
    vertexDotBufferCache,
    selectedVertexCenters,
    baseSize * VECTOR_VERTEX_SELECTED_SCALE,
    VECTOR_VERTEX_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawVectorVertexDotBatch(
    gl,
    program,
    buffer,
    vertexDotBufferCache,
    selectedVertexCenters,
    baseSize * VECTOR_VERTEX_SELECTED_INNER_SCALE,
    isMeasuring ? DISTANCE_GUIDE_STROKE : VECTOR_VERTEX_SELECTED_FILL,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};
