// others
import {
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
import { TVectorNode } from 'types/design/types';

// utils
import { drawVectorVertexDots } from '../drawVectorVertexDots';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const BASE_SIZE = VECTOR_VERTEX_SIZE;
const HOVER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_HOVER_SCALE;
const SELECTED_OUTER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_SELECTED_SCALE;
const SELECTED_INNER_SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_SELECTED_INNER_SCALE;

const node: TVectorNode = {
  fillColor: null,
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
  });

  it('should draw one dot at the base size for an unselected, unhovered vertex', () => {
    // before
    drawVectorVertexDots(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [],
      null,
      new Set(),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: VECTOR_VERTEX_FILL, height: BASE_SIZE, width: BASE_SIZE, x: -BASE_SIZE / 2, y: -BASE_SIZE / 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: VECTOR_VERTEX_FILL, height: BASE_SIZE, width: BASE_SIZE, x: 10 - BASE_SIZE / 2, y: -BASE_SIZE / 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw the hovered vertex at VECTOR_VERTEX_HOVER_SCALE times the base size and leave the other vertex untouched', () => {
    // before
    drawVectorVertexDots(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [],
      'v1',
      new Set(),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: VECTOR_VERTEX_FILL, height: HOVER_SIZE, width: HOVER_SIZE, x: -HOVER_SIZE / 2, y: -HOVER_SIZE / 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: VECTOR_VERTEX_FILL, height: BASE_SIZE, width: BASE_SIZE, x: 10 - BASE_SIZE / 2, y: -BASE_SIZE / 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw a selected vertex as two layered dots — a VECTOR_VERTEX_SELECTED_SCALE white outer circle and a VECTOR_VERTEX_SELECTED_INNER_SCALE blue inner dot', () => {
    // before
    drawVectorVertexDots(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1'],
      null,
      new Set(),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — v1 draws twice (outer + inner), v2 draws once
    expect(drawEllipseMock).toHaveBeenCalledTimes(3);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
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
      {},
      {},
      {},
      {
        fill: VECTOR_VERTEX_SELECTED_FILL,
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
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: VECTOR_VERTEX_FILL, height: BASE_SIZE, width: BASE_SIZE, x: 10 - BASE_SIZE / 2, y: -BASE_SIZE / 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should ignore the hovered id when that vertex is also selected — selection wins over hover sizing', () => {
    // before
    drawVectorVertexDots(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1'],
      'v1',
      new Set(),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — still exactly the selected outer/inner pair, no separately-scaled hover variant
    expect(drawEllipseMock).toHaveBeenCalledTimes(3);
    expect(drawEllipseMock.mock.calls.some((args) => args[3].width === SELECTED_OUTER_SIZE)).toBe(true);
    expect(drawEllipseMock.mock.calls.filter((args) => args[3].width === SELECTED_INNER_SIZE)).toHaveLength(1);
    expect(drawEllipseMock.mock.calls.some((args) => args[3].width === HOVER_SIZE)).toBe(false);
  });

  it('should draw a new (cut-marked), unselected, unhovered vertex as a white dot with a pink border, at the same size as a plain idle vertex', () => {
    // before
    drawVectorVertexDots(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [],
      null,
      new Set(['v1']),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — v1 is white with a pink border at base size, v2 stays the plain white dot with no border
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
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
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: VECTOR_VERTEX_FILL, height: BASE_SIZE, width: BASE_SIZE, x: 10 - BASE_SIZE / 2, y: -BASE_SIZE / 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw a new (cut-marked), hovered vertex as a white-with-pink-border dot at the enlarged hover size', () => {
    // before
    drawVectorVertexDots(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      [],
      'v1',
      new Set(['v1']),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
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

  it('should draw a new (cut-marked), selected vertex with the same white outer ring but a pink inner dot instead of blue', () => {
    // before
    drawVectorVertexDots(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      node,
      ['v1'],
      null,
      new Set(['v1']),
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result — outer ring stays white/unchanged, only the inner accent swaps to pink
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
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
      {},
      {},
      {},
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
  });
});
