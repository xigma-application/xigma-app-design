// utils
import { drawCurvedEditingOutline } from '../drawCurvedEditingOutline';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    LINES: 1,
    STATIC_DRAW: 35044,
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
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
const PATH_BOX = { flipX: false, flipY: false, height: 200, pathId: 'ellipse-1', rotation: 0, width: 200, x: 0, y: 0 };

describe('drawCurvedEditingOutline', () => {
  it('should stroke a fill-less outline around the whole typed content', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedEditingOutline(gl, program, buffer, PATH_BOX, 'hi', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expect.any(Number));
  });

  it('should draw nothing for empty content', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedEditingOutline(gl, program, buffer, PATH_BOX, '', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it("should follow the path's own rotation instead of always drawing as if unrotated", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawCurvedEditingOutline(gl, program, buffer, PATH_BOX, 'hi', 100, 100, IDENTITY_VIEWPORT);

    const [unrotatedCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    (gl.bufferData as ReturnType<typeof vi.fn>).mockClear();
    drawCurvedEditingOutline(gl, program, buffer, { ...PATH_BOX, rotation: 180 }, 'hi', 100, 100, IDENTITY_VIEWPORT);

    const [rotatedCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;

    // result
    expect(rotatedCall[1]).not.toEqual(unrotatedCall[1]);
  });
});
