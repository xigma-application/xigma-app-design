// others
import {
  DISTANCE_GUIDE_STROKE,
  VECTOR_CUT_CROSSING_FILL,
  VECTOR_VERTEX_FILL,
  VECTOR_VERTEX_HOVER_SCALE,
  VECTOR_VERTEX_SELECTED_FILL,
  VECTOR_VERTEX_SELECTED_INNER_SCALE,
  VECTOR_VERTEX_SELECTED_SCALE,
  VECTOR_VERTEX_SIZE,
} from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVertexDotBufferCacheEntry } from '../types';

// utils
import { drawVectorVertexDots } from '../drawVectorVertexDots';

const drawEllipseMock = vi.fn();
const drawVectorVertexDotBatchMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('../drawVectorVertexDotBatch', () => ({
  drawVectorVertexDotBatch: (...args: unknown[]): void => drawVectorVertexDotBatchMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const vertexDotBufferCache = new WeakMap<TPoint[], TVertexDotBufferCacheEntry[]>();

const BASE_SIZE = VECTOR_VERTEX_SIZE;
const HOVER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_HOVER_SCALE;
const SELECTED_OUTER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_SELECTED_SCALE;
const SELECTED_INNER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_SELECTED_INNER_SCALE;

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

describe('drawVectorVertexDots', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawVectorVertexDotBatchMock.mockClear();
  });

  it('should batch every unselected, unhovered vertex into a single plain-dot draw call at the base size', () => {
    // before
    drawVectorVertexDots(gl, program, buffer, vertexDotBufferCache, node, [], null, new Set(), false, 200, 150, IDENTITY_VIEWPORT);

    // result — plain batch carries both vertices; the two selected-tier batches still fire, empty
    expect(drawEllipseMock).not.toHaveBeenCalled();
    expect(drawVectorVertexDotBatchMock).toHaveBeenCalledTimes(3);
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v1, node.vertices.v2],
      BASE_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [],
      SELECTED_OUTER_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      3,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [],
      SELECTED_INNER_SIZE,
      VECTOR_VERTEX_SELECTED_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw the hovered vertex immediately at VECTOR_VERTEX_HOVER_SCALE times the base size, and leave the other vertex in the plain batch', () => {
    // before
    drawVectorVertexDots(gl, program, buffer, vertexDotBufferCache, node, [], 'v1', new Set(), false, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: VECTOR_VERTEX_FILL, height: HOVER_SIZE, width: HOVER_SIZE, x: -HOVER_SIZE / 2, y: -HOVER_SIZE / 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v2],
      BASE_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should batch a selected vertex into both the outer-ring and inner-dot selected batches, at their own scaled sizes', () => {
    // before
    drawVectorVertexDots(gl, program, buffer, vertexDotBufferCache, node, ['v1'], null, new Set(), false, 200, 150, IDENTITY_VIEWPORT);

    // result — v1 lands in the selected batches, v2 stays in the plain batch
    expect(drawEllipseMock).not.toHaveBeenCalled();
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v2],
      BASE_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v1],
      SELECTED_OUTER_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      3,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v1],
      SELECTED_INNER_SIZE,
      VECTOR_VERTEX_SELECTED_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should recolor the selected vertex’s inner dot orange instead of blue while a distance measurement is in progress', () => {
    // before
    drawVectorVertexDots(gl, program, buffer, vertexDotBufferCache, node, ['v1'], null, new Set(), true, 200, 150, IDENTITY_VIEWPORT);

    // result — outer ring stays white, only the inner dot swaps to the distance-guide orange
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v1],
      SELECTED_OUTER_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      3,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v1],
      SELECTED_INNER_SIZE,
      DISTANCE_GUIDE_STROKE,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should ignore the hovered id when that vertex is also selected — selection wins over hover sizing', () => {
    // before
    drawVectorVertexDots(gl, program, buffer, vertexDotBufferCache, node, ['v1'], 'v1', new Set(), false, 200, 150, IDENTITY_VIEWPORT);

    // result — v1 still lands in the selected batches (its own scaled sizes), never drawn at the hover size
    expect(drawEllipseMock).not.toHaveBeenCalled();
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v1],
      SELECTED_OUTER_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorVertexDotBatchMock.mock.calls.some((args) => args[5] === HOVER_SIZE)).toBe(false);
  });

  it('should draw a new (cut-marked), unselected, unhovered vertex immediately as a white dot with a pink border, at the same size as a plain idle vertex, and leave the other vertex batched', () => {
    // before
    drawVectorVertexDots(gl, program, buffer, vertexDotBufferCache, node, [], null, new Set(['v1']), false, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      {
        fill: VECTOR_VERTEX_FILL,
        height: BASE_SIZE,
        stroke: VECTOR_CUT_CROSSING_FILL,
        width: BASE_SIZE,
        x: -BASE_SIZE / 2,
        y: -BASE_SIZE / 2,
      },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v2],
      BASE_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw a new (cut-marked), hovered vertex immediately as a white-with-pink-border dot at the enlarged hover size', () => {
    // before
    drawVectorVertexDots(gl, program, buffer, vertexDotBufferCache, node, [], 'v1', new Set(['v1']), false, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      {
        fill: VECTOR_VERTEX_FILL,
        height: HOVER_SIZE,
        stroke: VECTOR_CUT_CROSSING_FILL,
        width: HOVER_SIZE,
        x: -HOVER_SIZE / 2,
        y: -HOVER_SIZE / 2,
      },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw a new (cut-marked), selected vertex immediately with the same white outer ring but a pink inner dot instead of blue', () => {
    // before
    drawVectorVertexDots(
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      node,
      ['v1'],
      null,
      new Set(['v1']),
      false,
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — drawn once immediately (both rings), not through either batch
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      {
        fill: VECTOR_VERTEX_FILL,
        height: SELECTED_OUTER_SIZE,
        width: SELECTED_OUTER_SIZE,
        x: -SELECTED_OUTER_SIZE / 2,
        y: -SELECTED_OUTER_SIZE / 2,
      },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      {
        fill: VECTOR_CUT_CROSSING_FILL,
        height: SELECTED_INNER_SIZE,
        width: SELECTED_INNER_SIZE,
        x: -SELECTED_INNER_SIZE / 2,
        y: -SELECTED_INNER_SIZE / 2,
      },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    // v1 was drawn immediately (both rings), so neither selected batch carries it — only v2's plain batch is non-empty
    expect(drawVectorVertexDotBatchMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      vertexDotBufferCache,
      [node.vertices.v2],
      BASE_SIZE,
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect((drawVectorVertexDotBatchMock.mock.calls[1][4] as unknown[]).length).toBe(0);
    expect((drawVectorVertexDotBatchMock.mock.calls[2][4] as unknown[]).length).toBe(0);
  });
});
