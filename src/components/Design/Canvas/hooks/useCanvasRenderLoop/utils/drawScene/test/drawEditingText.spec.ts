// types
import { TImageRenderContext } from '../../../types';

// utils
import { drawEditingText } from '../drawEditingText';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    ARRAY_BUFFER: 34962,
    FLOAT: 5126,
    LINE_LOOP: 2,
    RGBA: 6408,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    UNSIGNED_BYTE: 5121,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    createTexture: vi.fn(() => ({})),
    drawArrays: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    getUniformLocation: vi.fn(() => ({})),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    uniform4fv: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
  }) as unknown as WebGL2RenderingContext;

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const IMAGE_CONTEXT: TImageRenderContext = {
  buffer: {} as WebGLBuffer,
  cache: new Map(),
  checkerboardProgram: {} as WebGLProgram,
  dragSnapshotFaceBufferCache: new WeakMap(),
  dragSnapshotProgram: {} as WebGLProgram,
  dragSnapshotStrokeBufferCache: new WeakMap(),
  dragSnapshotTrackedByNodeId: new Map(),
  ellipseArcLengthCache: new Map(),
  faceBufferCache: new WeakMap(),
  gridBuffer: {} as WebGLBuffer,
  gridProgram: {} as WebGLProgram,
  isAlphaWriteEnabled: false,
  maskCompositeBuffer: {} as WebGLBuffer,
  maskCompositeProgram: {} as WebGLProgram,
  msdfBuffer: {} as WebGLBuffer,
  msdfProgram: {} as WebGLProgram,
  program: {} as WebGLProgram,
  renderTargetPool: {} as TImageRenderContext['renderTargetPool'],
  strokeBufferCache: new WeakMap(),
  textGeometryCache: new Map(),
  vertexDotBufferCache: new WeakMap(),
};

describe('drawEditingText', () => {
  it('should draw nothing when no text box is being edited', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawEditingText(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      null,
      'hello',
      0,
      1,
      0,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw an outline around the box being edited', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    drawEditingText(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      box,
      'hello',
      0,
      1,
      0,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should not draw the box outline while editing text on a path, since the ellipse already shows it', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const box = { flipX: false, flipY: false, height: 20, pathId: 'path-1', rotation: 0, width: 100, x: 0, y: 0 };

    // before — a collapsed selection, so the curved selection highlight's own outline (also a
    // LINE_LOOP) never draws and can't be mistaken for the box outline this test checks for
    drawEditingText(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      box,
      'hello',
      0,
      0,
      0,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should draw the live typed content through the same MSDF pipeline as committed text', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const box = { flipX: false, flipY: false, height: 20, rotation: 0, width: 100, x: 0, y: 0 };

    // before
    drawEditingText(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      box,
      'hello',
      0,
      1,
      0,
    );

    // result — "hello" is 5 known glyphs in the real MSDF atlas, 6 vertices each
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 30);
  });

  it("should rotate the outline around the box's own center, not the world origin, using the box's own rotation", () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const box = { flipX: false, flipY: false, height: 10, rotation: 90, width: 10, x: 0, y: 0 };

    // before
    drawEditingText(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      box,
      'hello',
      0,
      1,
      0,
    );

    // result — a 90deg rotation around the box's own center maps its top-left corner to its top-right
    const [outlineCall] = (gl.bufferData as ReturnType<typeof vi.fn>).mock.calls;
    const vertices: Float32Array = outlineCall[1];

    expect(vertices[0]).toBeCloseTo(10);
    expect(vertices[1]).toBeCloseTo(0);
  });
});
