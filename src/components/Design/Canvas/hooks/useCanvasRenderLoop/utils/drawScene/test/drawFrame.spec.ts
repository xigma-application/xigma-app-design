// types
import { NodeType } from 'types/design/enums';
import { TImageRenderContext } from '../../../types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawFrame } from '../drawFrame';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
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

describe('drawFrame', () => {
  it('should draw nothing when no draft shape is given', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawFrame(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should delegate to drawDraftLine for a line draft', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawFrame(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ draftRef: { current: { stroke: '#000000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 } } }),
    );

    // result — 1 segment fill + 2 endpoint-handle fills = 3 TRIANGLES draws, 2 endpoint-handle
    // strokes = 2 LINE_LOOP draws
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(trianglesDraws).toHaveLength(3);
    expect(lineLoopDraws).toHaveLength(2);
  });

  it('should delegate to drawDraftShape for a non-line draft', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawFrame(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: IMAGE_CONTEXT, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ draftRef: { current: { fill: '#D9D9D9', height: 20, type: NodeType.rectangle, width: 10, x: 0, y: 0 } } }),
    );

    // result — its outline + 4 corner handles
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });
});
