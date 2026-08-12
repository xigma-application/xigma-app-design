// others
import { MARQUEE_FILL_ALPHA } from 'constant/canvas';

// utils
import { drawMarquee } from '../drawMarquee';

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

describe('drawMarquee', () => {
  it('should draw nothing when no marquee rect is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawMarquee(gl, program, buffer, null, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a translucent fill and a stroke pass when a marquee rect is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawMarquee(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should use MARQUEE_FILL_ALPHA for the fill, not full opacity', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawMarquee(gl, program, buffer, { height: 20, width: 10, x: 0, y: 0 }, 100, 100, IDENTITY_VIEWPORT);

    // result
    const [firstColorCall] = (gl.uniform4fv as ReturnType<typeof vi.fn>).mock.calls;
    const [, , , alpha] = firstColorCall[1] as [number, number, number, number];

    expect(alpha).toBe(MARQUEE_FILL_ALPHA);
  });
});
