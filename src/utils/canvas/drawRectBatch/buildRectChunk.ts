// others
import { RECT_BATCH_FLOATS_PER_VERTEX } from './constants';

// types
import { TBatchShape, TRectBatch, TRectChunk } from './types';

// utils
import { appendShapeTriangles } from './appendShapeTriangles';
import { getRectChunkBounds } from './getRectChunkBounds';

export const buildRectChunk = (
  gl: WebGL2RenderingContext,
  scratch: TRectBatch,
  nodes: TBatchShape[],
  baseOpacity: number,
  getOpacity: (node: TBatchShape) => number,
): TRectChunk | null => {
  const buffer = gl.createBuffer();

  if (buffer) {
    scratch.floatCount = 0;
    nodes.forEach((node) => appendShapeTriangles(scratch, node, getOpacity(node)));
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, scratch.data.subarray(0, scratch.floatCount), gl.STATIC_DRAW);

    const vertexCount = scratch.floatCount / RECT_BATCH_FLOATS_PER_VERTEX;

    scratch.floatCount = 0;

    return { baseOpacity, bounds: getRectChunkBounds(nodes), buffer, nodes, vertexCount };
  }

  return null;
};
