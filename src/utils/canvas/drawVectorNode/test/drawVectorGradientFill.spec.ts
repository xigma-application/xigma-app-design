// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { drawVectorGradientFill } from '../drawVectorGradientFill';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ALWAYS: 519,
    INVERT: 5386,
    KEEP: 7680,
    NOTEQUAL: 517,
    STATIC_DRAW: 35044,
    STENCIL_BUFFER_BIT: 1024,
    STENCIL_TEST: 2960,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    clear: vi.fn(),
    colorMask: vi.fn(),
    createBuffer: vi.fn((): WebGLBuffer => ({}) as WebGLBuffer),
    disable: vi.fn(),
    drawArrays: vi.fn(),
    enable: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    stencilFunc: vi.fn(),
    stencilOp: vi.fn(),
    uniform1f: vi.fn(),
    uniform1fv: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const GRADIENT_PAINT: TGradientPaint = {
  end: { x: 1, y: 0.5 },
  opacity: 100,
  start: { x: 0, y: 0.5 },
  stops: [
    { color: '#ffffff', opacity: 100, position: 0 },
    { color: '#000000', opacity: 100, position: 1 },
  ],
  type: 'gradient-linear',
};

describe('drawVectorGradientFill', () => {
  it('should skip every GL call when there are no faces to fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorGradientFill(gl, program, buffer, null, null, [], GRADIENT_PAINT, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should run the even-odd stencil pass then composite the fill through a covering quad, in order', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];

    // before
    drawVectorGradientFill(gl, program, buffer, null, null, faces, GRADIENT_PAINT, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, gl.TRIANGLE_FAN, 0, 3);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, 6);
    expect(gl.disable).toHaveBeenCalledWith(gl.STENCIL_TEST);
  });

  it('should pass the gradient’s start/end points, type index, and stop count as uniforms', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];

    // before
    drawVectorGradientFill(gl, program, buffer, null, null, faces, GRADIENT_PAINT, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 0, 0.5);
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 1, 0.5);
    expect(gl.uniform1i).toHaveBeenCalledWith(expect.anything(), 0);
    expect(gl.uniform1i).toHaveBeenCalledWith(expect.anything(), 2);
  });

  it('should pass the given alpha as the overall opacity uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];

    // before
    drawVectorGradientFill(gl, program, buffer, null, null, faces, GRADIENT_PAINT, 100, 100, IDENTITY_VIEWPORT, false, 0.5);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0.5);
  });

  it('should pass a default radiusRatio of 1 for a radial paint that has none set', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];

    // before
    drawVectorGradientFill(gl, program, buffer, null, null, faces, { ...GRADIENT_PAINT, type: 'gradient-radial' }, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 1);
  });

  it('should pass the paint’s own radiusRatio for a radial paint', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];

    // before
    drawVectorGradientFill(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      { ...GRADIENT_PAINT, radiusRatio: 0.4, type: 'gradient-radial' },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0.4);
  });

  it('should pass the paint’s own radiusRatio for an angular paint', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];

    // before
    drawVectorGradientFill(
      gl,
      program,
      buffer,
      null,
      null,
      faces,
      { ...GRADIENT_PAINT, radiusRatio: 0.4, type: 'gradient-angular' },
      100,
      100,
      IDENTITY_VIEWPORT,
      false,
    );

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 0.4);
  });

  it('should ignore radiusRatio for a non-radial, non-angular paint, always passing 1', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const faces = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    ];

    // before
    drawVectorGradientFill(gl, program, buffer, null, null, faces, { ...GRADIENT_PAINT, radiusRatio: 0.4 }, 100, 100, IDENTITY_VIEWPORT, false);

    // result
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 1);
    expect(gl.uniform1f).not.toHaveBeenCalledWith(expect.anything(), 0.4);
  });
});
