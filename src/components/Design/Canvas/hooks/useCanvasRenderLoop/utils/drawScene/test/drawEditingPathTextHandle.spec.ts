// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { drawEditingPathTextHandle } from '../drawEditingPathTextHandle';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
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

const buildEditingTextBox = (overrides: Partial<TEditingTextBox> = {}): TEditingTextBox => ({
  flipX: false,
  flipY: false,
  height: 200,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawEditingPathTextHandle', () => {
  it('should draw the offset handle for the box currently being edited, including one that has no committed node yet', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawEditingPathTextHandle(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      buildEditingTextBox(),
      100,
      100,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
  });

  it('should draw nothing when the editing box is not on a path', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawEditingPathTextHandle(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      buildEditingTextBox({ pathId: null }),
      100,
      100,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when there is no editing session', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawEditingPathTextHandle({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, null, 100, 100);

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
