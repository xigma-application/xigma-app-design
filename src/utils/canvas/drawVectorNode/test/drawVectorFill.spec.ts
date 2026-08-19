// utils
import { drawVectorFill } from '../drawVectorFill';

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
    disable: vi.fn(),
    drawArrays: vi.fn(),
    enable: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    stencilFunc: vi.fn(),
    stencilOp: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorFill', () => {
  it('should skip every GL call when there are no faces to fill', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawVectorFill(gl, program, buffer, [], '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.clear).not.toHaveBeenCalled();
    expect(gl.enable).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
    expect(gl.bufferData).not.toHaveBeenCalled();
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
    drawVectorFill(gl, program, buffer, faces, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result — stencil setup precedes the per-face fan pass, which precedes the composite pass
    expect(gl.clear).toHaveBeenCalledWith(gl.STENCIL_BUFFER_BIT);
    expect(gl.enable).toHaveBeenCalledWith(gl.STENCIL_TEST);
    expect(gl.colorMask).toHaveBeenNthCalledWith(1, false, false, false, false);
    expect(gl.stencilFunc).toHaveBeenNthCalledWith(1, gl.ALWAYS, 1, 0xff);
    expect(gl.stencilOp).toHaveBeenNthCalledWith(1, gl.KEEP, gl.KEEP, gl.INVERT);

    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, gl.TRIANGLE_FAN, 0, 3);

    expect(gl.colorMask).toHaveBeenNthCalledWith(2, true, true, true, true);
    expect(gl.stencilFunc).toHaveBeenNthCalledWith(2, gl.NOTEQUAL, 0, 0xff);
    expect(gl.stencilOp).toHaveBeenNthCalledWith(2, gl.KEEP, gl.KEEP, gl.KEEP);

    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLES, 0, 6);
    expect(gl.disable).toHaveBeenCalledWith(gl.STENCIL_TEST);

    // call-order sanity: disable only happens after both draw passes have run
    const disableOrder = (gl.disable as ReturnType<typeof vi.fn>).mock.invocationCallOrder[0];
    const secondDrawOrder = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.invocationCallOrder[1];

    expect(disableOrder).toBeGreaterThan(secondDrawOrder);
  });

  it('should draw one triangle-fan per face when there are multiple faces', () => {
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
      [
        { x: 20, y: 20 },
        { x: 30, y: 20 },
        { x: 30, y: 30 },
        { x: 20, y: 30 },
      ],
    ];

    // before
    drawVectorFill(gl, program, buffer, faces, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result — one TRIANGLE_FAN per face (3 then 4 vertices), plus the final composite TRIANGLES pass
    expect(gl.drawArrays).toHaveBeenCalledTimes(3);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(1, gl.TRIANGLE_FAN, 0, 3);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(2, gl.TRIANGLE_FAN, 0, 4);
    expect(gl.drawArrays).toHaveBeenNthCalledWith(3, gl.TRIANGLES, 0, 6);
  });
});
