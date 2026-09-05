// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { drawVectorVariableStroke } from '../drawVectorVariableStroke';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    STATIC_DRAW: 35044,
    TRIANGLES: 4,
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

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: seg('s1', 'a', 'b') },
  strokeColor: '#0d99ff',
  strokeWidth: 2,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } },
  widthProfile: { points: { p1: { id: 'p1', leftOffset: 5, position: 0.5, rightOffset: 5 } } },
  ...overrides,
});

describe('drawVectorVariableStroke', () => {
  it('should draw nothing and skip every GL call when every sample collapses to a zero-length loop', () => {
    // mock — a single self-closing segment whose start and end coincide, so every normal is degenerate
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'a') },
      vertices: { a: { id: 'a', x: 5, y: 5 } },
      widthProfile: null,
    });

    // before
    drawVectorVariableStroke(gl, program, buffer, node, '#0d99ff', 100, 100, IDENTITY_VIEWPORT);

    // result
    expect(gl.bufferData).not.toHaveBeenCalled();
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should upload the viewport uniforms and draw one triangles pass for a profiled node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode();

    // before
    drawVectorVariableStroke(gl, program, buffer, node, '#0d99ff', 200, 150, { x: 5, y: 7, zoom: 2 });

    // result
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 5, 7); // u_viewportOffset
    expect(gl.uniform1f).toHaveBeenCalledWith(expect.anything(), 2); // u_zoom
    expect(gl.uniform2f).toHaveBeenCalledWith(expect.anything(), 200, 150); // u_resolution
    expect(gl.bufferData).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });

  it('should default to fully opaque, and forward an explicit alpha into the color uniform', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode();

    // before
    drawVectorVariableStroke(gl, program, buffer, node, '#0d99ff', 200, 150, IDENTITY_VIEWPORT);
    drawVectorVariableStroke(gl, program, buffer, node, '#0d99ff', 200, 150, IDENTITY_VIEWPORT, 0.5);

    // result
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(1, expect.anything(), [13 / 255, 153 / 255, 1, 1]);
    expect(gl.uniform4fv).toHaveBeenNthCalledWith(2, expect.anything(), [13 / 255, 153 / 255, 1, 0.5]);
  });
});
