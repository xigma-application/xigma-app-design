// types
import { NodeType, PathType } from 'types/design/enums';
import { TImageRenderContext } from '../../../types';

// utils
import { drawDraftShape } from '../drawDraftShape';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
    LINE_LOOP: 2,
    RGBA: 6408,
    STATIC_DRAW: 35044,
    TEXTURE0: 33984,
    TEXTURE_2D: 3553,
    TRIANGLES: 4,
    TRIANGLE_FAN: 6,
    UNSIGNED_BYTE: 5121,
    activeTexture: vi.fn(),
    bindBuffer: vi.fn(),
    bindTexture: vi.fn(),
    bufferData: vi.fn(),
    createBuffer: vi.fn(() => ({})),
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
  ellipseArcLengthCache: new Map(),
  faceBufferCache: new WeakMap(),
  gridBuffer: {} as WebGLBuffer,
  gridProgram: {} as WebGLProgram,
  msdfBuffer: {} as WebGLBuffer,
  msdfProgram: {} as WebGLProgram,
  program: {} as WebGLProgram,
  strokeBufferCache: new WeakMap(),
  textGeometryCache: new Map(),
  vertexDotBufferCache: new WeakMap(),
};

describe('drawDraftShape', () => {
  it('should draw the draft outline and its 4 corner handles when given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#D9D9D9', height: 20, type: NodeType.rectangle, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should show the shape filling in live for a rectangle draft, not just its outline', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#D9D9D9', height: 20, type: NodeType.rectangle, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — 4 corner handles + 1 for the rectangle's own fill
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(trianglesDraws).toHaveLength(5);
  });

  it('should show an elliptical fill live for an ellipse draft, without also filling its bounding box', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#D9D9D9', height: 20, type: NodeType.ellipse, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));

    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(trianglesDraws).toHaveLength(4);
  });

  it('should still draw a rectangular bounding-box outline for an ellipse draft, connecting its corner handles', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#D9D9D9', height: 20, type: NodeType.ellipse, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — same as rectangle/frame: 1 box outline + 4 corner handles = 5 LINE_LOOP draws,
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
    expect(lineLoopDraws.every(([, , count]) => count === 4)).toBe(true);
  });

  it('should show a polygonal fill live for a polygon draft, without also filling its bounding box', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#D9D9D9', height: 20, sides: 5, type: NodeType.polygon, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));

    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(trianglesDraws).toHaveLength(4);
  });

  it('should still draw a rectangular bounding-box outline for a polygon draft, connecting its corner handles', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#D9D9D9', height: 20, sides: 5, type: NodeType.polygon, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — same as rectangle/frame: 1 box outline + 4 corner handles = 5 LINE_LOOP draws
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
    expect(lineLoopDraws.every(([, , count]) => count === 4)).toBe(true);
  });

  it('should show a star fill live for a star draft, without also filling its bounding box', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#D9D9D9', height: 20, points: 5, ratio: 0.382, type: NodeType.star, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));

    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(trianglesDraws).toHaveLength(4);
  });

  it('should still draw a rectangular bounding-box outline for a star draft, connecting its corner handles', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#D9D9D9', height: 20, points: 5, ratio: 0.382, type: NodeType.star, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — same as rectangle/frame: 1 box outline + 4 corner handles = 5 LINE_LOOP draws
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
    expect(lineLoopDraws.every(([, , count]) => count === 4)).toBe(true);
  });

  it('should show a textured fill live for a media draft, without also filling its bounding box', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { height: 20, src: 'image.png', type: NodeType.media, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);

    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    // 4 corner handles + 1 for the media quad itself
    expect(trianglesDraws).toHaveLength(5);
  });

  it('should still draw a rectangular bounding-box outline for a media draft, connecting its corner handles', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { height: 20, src: 'image.png', type: NodeType.media, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — same as rectangle/frame: 1 box outline + 4 corner handles = 5 LINE_LOOP draws
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
    expect(lineLoopDraws.every(([, , count]) => count === 4)).toBe(true);
  });

  it('should keep a frame draft fill-less, showing only its outline', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#FFFFFF', height: 20, type: NodeType.frame, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — only the 4 corner handles, no fill for the frame shape itself
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(trianglesDraws).toHaveLength(4);
  });

  it('should keep a section draft fill-less, showing only its outline', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { fill: '#444444', height: 20, type: NodeType.section, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — only the 4 corner handles, no fill for the section shape itself
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(trianglesDraws).toHaveLength(4);
  });

  it('should show only a dashed ellipse outline for a path draft, with no fill and no corner handles', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { height: 20, pathType: PathType.ellipse, type: NodeType.path, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — no TRIANGLE_FAN fill and no TRIANGLES corner-handle fills, since the path draft
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.TRIANGLE_FAN, 0, expect.any(Number));
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));

    // result — no closed LINE_LOOP ring either, since a dashed outline draws disconnected segments
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.LINE_LOOP, 0, expect.any(Number));

    // result — just the single dashed ellipse outline draw
    const linesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINES);

    expect(linesDraws).toHaveLength(1);
  });

  it('should keep a text draft fill-less, showing only its outline', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawDraftShape(
      gl,
      program,
      buffer,
      IMAGE_CONTEXT,
      { height: 20, type: NodeType.text, width: 10, x: 0, y: 0 },
      100,
      100,
      IDENTITY_VIEWPORT,
    );

    // result — only the 4 corner handles, no fill for the text box itself
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);

    expect(trianglesDraws).toHaveLength(4);

    // result — box outline + 4 corner handles = 5 LINE_LOOP draws
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });
});
