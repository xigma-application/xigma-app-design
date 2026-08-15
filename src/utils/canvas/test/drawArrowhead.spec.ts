// utils
import { drawArrowhead } from '../drawArrowhead';

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

describe('drawArrowhead', () => {
  it('should draw 2 thick wing segments and 3 round-cap fills, not a single filled triangle', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawArrowhead(gl, program, buffer, { x: 10, y: 10 }, { x: 0, y: 1 }, 14, 3, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result — 2 wing quads (TRIANGLES) + 3 endpoint-cap circles (TRIANGLE_FAN, for the tip and each wing end)
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const fanDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLE_FAN);

    expect(trianglesDraws).toHaveLength(2);
    expect(fanDraws).toHaveLength(3);
  });

  it('should back both wings away from the tip, opposite the outward direction', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before — pointing straight up (outward = {0, -1}) from a tip at the origin, so both wings
    drawArrowhead(gl, program, buffer, { x: 0, y: 0 }, { x: 0, y: -1 }, 10, 2, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result — a wing's quad is a symmetric perpendicular offset around the tip->wingEnd segment, so
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const wingVertexArrays = bufferDataCalls.slice(0, 2).map(([, data]) => data as Float32Array);

    wingVertexArrays.forEach((vertices) => {
      const yValues = Array.from(vertices).filter((_, index) => index % 2 === 1);
      const meanY = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;

      expect(meanY).toBeGreaterThan(0);
    });
  });

  it('should size each round cap to the given strokeWidth', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawArrowhead(gl, program, buffer, { x: 0, y: 0 }, { x: 1, y: 0 }, 10, 6, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result — the tip's own cap circle is the 3rd bufferData call (after the 2 wing quads)
    const bufferDataCalls = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const [, , tipCapCall] = bufferDataCalls;
    const vertices: Float32Array = tipCapCall[1];
    const xValues = Array.from(vertices).filter((_, index) => index % 2 === 0);
    const width = Math.max(...xValues) - Math.min(...xValues);

    expect(width).toBeCloseTo(6);
  });
});
