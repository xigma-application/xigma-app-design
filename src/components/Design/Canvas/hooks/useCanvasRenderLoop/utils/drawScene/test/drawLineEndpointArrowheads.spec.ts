// types
import { NodeType } from 'types/design/enums';

// utils
import { drawLineEndpointArrowheads } from '../drawLineEndpointArrowheads';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BASE_LINE = { stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 0 } as const;

describe('drawLineEndpointArrowheads', () => {
  it('should draw nothing for a plain line with default endpoints', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLineEndpointArrowheads(gl, program, buffer, BASE_LINE, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw one arrowhead when only endPoint is set to arrow', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLineEndpointArrowheads(gl, program, buffer, { ...BASE_LINE, endPoint: 'arrow' }, 100, 100, IDENTITY_VIEWPORT);

    // result — 2 wing quads + 3 round-cap fills, per drawArrowhead
    expect(gl.drawArrays).toHaveBeenCalledTimes(5);
  });

  it('should draw two arrowheads when both endpoints are set to arrow', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLineEndpointArrowheads(gl, program, buffer, { ...BASE_LINE, endPoint: 'arrow', startPoint: 'arrow' }, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(10);
  });

  it('should not draw for a degenerate zero-length line even if an endpoint requests an arrow', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawLineEndpointArrowheads(
      gl,
      program,
      buffer,
      { endPoint: 'arrow', stroke: '#000000', type: NodeType.line, x1: 5, x2: 5, y1: 5, y2: 5 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
