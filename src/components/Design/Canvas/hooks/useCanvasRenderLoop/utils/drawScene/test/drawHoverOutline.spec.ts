// types
import { NodeType } from 'types/design/enums';
import {
  TBoxSceneNode,
  TMediaNode,
  TPathNode,
  TPolygonNode,
  TSceneNode,
  TSectionNode,
  TStarNode,
  TTextNode,
  TVectorNode,
} from 'types/design/types';

// utils
import { drawHoverOutline } from '../drawHoverOutline';

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

const buildNode = (
  overrides: Partial<Exclude<TBoxSceneNode, TPathNode | TPolygonNode | TSectionNode | TStarNode | TMediaNode | TTextNode>>,
): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id: 'node',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('drawHoverOutline', () => {
  it('should draw nothing when no node is hovered', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, null, 100, 100, [], {});

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw only a thick outline, with no corner handles, for the hovered node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode({ height: 20, width: 10, x: 0, y: 0 });

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, node, 100, 100, [], {});

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 24);
  });

  it('should draw an elliptical thick outline for a hovered ellipse node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const node = buildNode({ height: 20, type: NodeType.ellipse, width: 10, x: 0, y: 0 });

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, node, 100, 100, [], {});

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.TRIANGLES, 0, 24);
  });

  it('should draw a polygonal thick outline for a hovered polygon node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const polygon: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 20,
      id: 'a',
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides: 6,
      type: NodeType.polygon,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, polygon, 100, 100, [], {});

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6 * 6);
  });

  it('should draw a star-shaped thick outline for a hovered star node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const star: TSceneNode = {
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: 20,
      id: 'a',
      name: 'Star',
      parentId: null,
      points: 5,
      ratio: 0.382,
      rotation: 0,
      type: NodeType.star,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, star, 100, 100, [], {});

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 10 * 6);
  });

  it('should draw a thin underline sized to the text content, not the box, for a hovered text node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const text: TSceneNode = {
      content: 'hello',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 200,
      id: 'a',
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: 400,
      x: 0,
      y: 0,
    };

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, text, 100, 100, [], {});

    // result — a single thin quad, not the 24-vertex bounding-box ring
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should highlight a hovered text-on-path by its vector contour along the curve, not a straight underline', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vector: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'vec-1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 2,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 40, y: 0 }, v3: { id: 'v3', x: 80, y: 30 } },
    };
    const text: TSceneNode = {
      content: 'x',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: 0,
      id: 'a',
      name: 'Text',
      parentId: null,
      pathId: 'vec-1',
      rotation: 0,
      type: NodeType.text,
      width: 90,
      x: 0,
      y: 0,
    };

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, text, 100, 100, [], {
      'vec-1': vector,
    });

    // result — the multi-segment vector stroke (more than the single 6-vertex quad a text underline
    // would emit), proving the contour, not the underline, was drawn
    const [firstCall] = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls;

    expect(firstCall[0]).toBe(gl.TRIANGLES);
    expect(firstCall[2]).toBeGreaterThan(6);
  });

  it('should draw a thin highlight along the segment for a hovered line node, not a bounding-box ring', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const line: TSceneNode = {
      id: 'a',
      name: 'Line',
      parentId: null,
      stroke: '#000000',
      type: NodeType.line,
      x1: 0,
      x2: 10,
      y1: 0,
      y2: 10,
    };

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, line, 100, 100, [], {});

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 6);
  });

  it('should draw a vector stroke along the flattened segments for a hovered vector node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vector: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 2,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
    };

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, vector, 100, 100, [], {});

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });

  it('should draw nothing for the hovered node while it is the node open in Vector Edit Mode', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vector: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 2,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
    };

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, vector, 100, 100, ['a'], {});

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing for the hovered node while it is the second of several nodes open in Vector Edit Mode', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vector: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'b',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 2,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 10 } },
    };

    // before
    drawHoverOutline({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, vector, 100, 100, ['a', 'b'], {});

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
