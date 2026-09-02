// types
import { NodeType, PathType } from 'types/design/enums';
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
import { drawPerNodeSelectionOutlines } from '../drawPerNodeSelectionOutlines';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINES: 1,
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

describe('drawPerNodeSelectionOutlines', () => {
  it('should draw a separate outline and 4 corner handles for each node', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', parentId: 'frame-a', x: 0, y: 0 }), buildNode({ id: 'b', parentId: 'frame-b', x: 40, y: 0 })];

    // before
    drawPerNodeSelectionOutlines(gl, program, buffer, nodes, 100, 100, IDENTITY_VIEWPORT, [], {});

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(10);
  });

  it('should draw a thin segment and 2 endpoint handles for a selected line, not a bounding-box outline', () => {
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
    drawPerNodeSelectionOutlines(gl, program, buffer, [line], 100, 100, IDENTITY_VIEWPORT, [], {});

    // result — 1 segment fill + 2 endpoint-handle fills = 3 TRIANGLES draws, 2 endpoint-handle
    const trianglesDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLES);
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(trianglesDraws).toHaveLength(3);
    expect(lineLoopDraws).toHaveLength(2);
  });

  // the default-case rendering (bounding box, corner handles, path-text handle, font-size guide)
  // lives in drawDefaultSelectionOutline.ts — see its own spec for that behavior in detail.

  it('should draw a bounding-box outline and 4 corner handles for a selected vector node, using its computed bounds', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vector: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 40, y: 0 },
        v3: { id: 'v3', x: 40, y: 40 },
        v4: { id: 'v4', x: 0, y: 40 },
      },
    };

    // before
    drawPerNodeSelectionOutlines(gl, program, buffer, [vector], 100, 100, IDENTITY_VIEWPORT, [], {});

    // result — 1 outline rect + 4 corner handles = 5 LINE_LOOP draws
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });

  // the vector-as-text-path-guide suppression (no selection chrome while bound) lives in
  // drawVectorSelectionOutlineUnlessTextPathGuide.ts — see its own spec for that branching.

  it('should draw a rotated bounding-box outline for a selected vector node with a persisted rotation', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vector: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 45,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 40, y: 0 },
        v3: { id: 'v3', x: 40, y: 40 },
        v4: { id: 'v4', x: 0, y: 40 },
      },
    };

    // before
    drawPerNodeSelectionOutlines(gl, program, buffer, [vector], 100, 100, IDENTITY_VIEWPORT, [], {});

    // result — 1 outline rect + 4 corner handles = 5 LINE_LOOP draws, unaffected by rotation
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should draw nothing for a vector node that is currently in Vector Edit Mode, to avoid doubling up with its own handle layer', () => {
    // mock — the same node stays in selectedNodes while editing, so the box outline must defer to
    // drawVectorEditHandlesLayer instead of drawing alongside it
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const vector: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'a',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x: 0, y: 0 },
        v2: { id: 'v2', x: 40, y: 0 },
        v3: { id: 'v3', x: 40, y: 40 },
        v4: { id: 'v4', x: 0, y: 40 },
      },
    };

    // before
    drawPerNodeSelectionOutlines(gl, program, buffer, [vector], 100, 100, IDENTITY_VIEWPORT, ['a'], {});

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing for a selected bare path node, not a bounding-box outline', () => {
    // mock — a freshly created text-on-path node selects its path node while the user is still
    // typing; that path node must stay invisible here, since drawPathOutline already renders it
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const path: TPathNode = {
      height: 200,
      id: 'a',
      name: 'Path',
      parentId: null,
      pathType: PathType.ellipse,
      rotation: 0,
      type: NodeType.path,
      width: 200,
      x: 0,
      y: 0,
    };

    // before
    drawPerNodeSelectionOutlines(gl, program, buffer, [path], 100, 100, IDENTITY_VIEWPORT, [], {});

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
