// utils
import { drawRect } from '../drawRect';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
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

describe('drawRect', () => {
  it('should draw filled triangles when fill is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(gl, program, buffer, { fill: '#ffffff', height: 10, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw an outline when stroke is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(gl, program, buffer, { height: 10, stroke: '#ffffff', width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should draw nothing when neither fill nor stroke is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(gl, program, buffer, { height: 10, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the viewport transform and resolution as uniforms', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 10, width: 10, x: 0, y: 0 },
      100,
      200,
      {
        x: 5,
        y: 15,
        zoom: 2,
      },
      0,
    );

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 15);
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 100, 200);
  });

  it('should upload raw world-space coordinates, not pre-computed clip space', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(gl, program, buffer, { fill: '#ffffff', height: 10, width: 10, x: 3, y: 4 }, 100, 100, IDENTITY_VIEWPORT, 0);

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBe(3);
    expect(vertices[1]).toBe(4);
  });

  it('should rotate all corners around the center when rotation is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawRect(gl, program, buffer, { fill: '#ffffff', height: 10, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT, 90);

    // result
    const [firstFillCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = firstFillCall[1];

    expect(vertices[0]).toBeCloseTo(10);
    expect(vertices[1]).toBeCloseTo(0);
  });
});
