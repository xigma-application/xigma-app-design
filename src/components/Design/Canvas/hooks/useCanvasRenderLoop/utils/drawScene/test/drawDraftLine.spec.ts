// types
import { NodeType } from 'types/design/enums';

// utils
import { drawDraftLine } from '../drawDraftLine';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
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

describe('drawDraftLine', () => {
  it('should draw a live segment and 2 endpoint handles for a line draft, not a box outline', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftLine(
      gl,
      program,
      buffer,
      { stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — 1 segment fill + 2 endpoint-handle fills = 3 TRIANGLES draws, 2 endpoint-handle
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(trianglesDraws).toHaveLength(3);
    expect(lineLoopDraws).toHaveLength(2);
  });

  it('should also draw an arrowhead while dragging out a draft with an arrow endPoint', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftLine(
      gl,
      program,
      buffer,
      { endPoint: 'arrow', stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — segment (1) + arrowhead wings (2) + endpoint handles (2) = 5 TRIANGLES draws
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const fanDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLE_FAN);

    expect(trianglesDraws).toHaveLength(5);
    expect(fanDraws).toHaveLength(3);
  });
});
