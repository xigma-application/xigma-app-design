// utils
import { drawStar } from '../drawStar';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
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

describe('drawStar', () => {
  it('should delegate to the rounded triangle-fan rendering when cornerRadius is set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStar(
      gl,
      program,
      buffer,
      { cornerRadius: 10, fill: '#ffffff', height: 100, points: 5, ratio: 0.382, width: 100, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should delegate to the plain fan rendering when cornerRadius is 0', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStar(
      gl,
      program,
      buffer,
      { cornerRadius: 0, fill: '#ffffff', height: 10, points: 5, ratio: 0.382, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result — the raw star fan has 10 vertices + center + closing point, not a rounded arc-fan
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, 12);
  });

  it('should delegate to the plain fan rendering when cornerRadius is absent entirely', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawStar(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 10, points: 5, ratio: 0.382, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
      false,
      0,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, 12);
  });
});
