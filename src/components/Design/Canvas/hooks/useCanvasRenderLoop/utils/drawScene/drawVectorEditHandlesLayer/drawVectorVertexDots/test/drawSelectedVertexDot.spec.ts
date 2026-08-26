// others
import { VECTOR_CUT_CROSSING_FILL, VECTOR_VERTEX_FILL, VECTOR_VERTEX_SELECTED_FILL } from 'constant/canvas';

// types
import { TVectorVertex } from 'types/design/types';

// utils
import { drawSelectedVertexDot } from '../drawSelectedVertexDot';

const drawVertexDotMock = vi.fn();

vi.mock('../drawVertexDot', () => ({ drawVertexDot: (...args: unknown[]): void => drawVertexDotMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const vertex: TVectorVertex = { id: 'v1', x: 10, y: 20 };

describe('drawSelectedVertexDot', () => {
  beforeEach(() => {
    drawVertexDotMock.mockClear();
  });

  it('should draw the outer ring in the plain vertex fill and the inner dot in the selected fill for an ordinary selected vertex', () => {
    // before
    drawSelectedVertexDot(gl, program, buffer, vertex, false, 6, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVertexDotMock).toHaveBeenCalledTimes(2);
    expect(drawVertexDotMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      10,
      20,
      expect.any(Number),
      VECTOR_VERTEX_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVertexDotMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      10,
      20,
      expect.any(Number),
      VECTOR_VERTEX_SELECTED_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should draw the inner dot in the cut-crossing fill instead when the vertex is a brand-new one', () => {
    // before
    drawSelectedVertexDot(gl, program, buffer, vertex, true, 6, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVertexDotMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      10,
      20,
      expect.any(Number),
      VECTOR_CUT_CROSSING_FILL,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
