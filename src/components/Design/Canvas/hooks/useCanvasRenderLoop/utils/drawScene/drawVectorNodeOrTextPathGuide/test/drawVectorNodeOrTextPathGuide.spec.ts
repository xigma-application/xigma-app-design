// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { createVectorSnapshotsRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/hooks/useVectorSnapshotsRefs/createVectorSnapshotsRefs';
import { drawVectorNodeOrTextPathGuide } from '../drawVectorNodeOrTextPathGuide';

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
    generateMipmap: vi.fn(),
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

const buildVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
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
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
  ...overrides,
});

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 0,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'a',
  rotation: 0,
  type: NodeType.text,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const draw = (
  gl: WebGL2RenderingContext,
  node: TVectorNode,
  pathOutlineStyles: Map<string, 'editing' | 'hover' | 'selected'>,
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  const program = {} as WebGLProgram;
  const buffer = {} as WebGLBuffer;
  const context: TDrawSceneContext = {
    buffer,
    canvasHeight: 100,
    canvasWidth: 100,
    gl,
    imageContext: {
      dragSnapshotFaceBufferCache: new WeakMap(),
      dragSnapshotProgram: program,
      dragSnapshotStrokeBufferCache: new WeakMap(),
      faceBufferCache: new WeakMap(),
      isAlphaWriteEnabled: false,
      strokeBufferCache: new WeakMap(),
    } as TDrawSceneContext['imageContext'],
    program,
    viewport: IDENTITY_VIEWPORT,
  };

  drawVectorNodeOrTextPathGuide(context, node, createVectorSnapshotsRefs(), pathOutlineStyles, nodesById, editingPathId);
};

describe('drawVectorNodeOrTextPathGuide', () => {
  it('should draw its own stroke normally for an unbound vector', () => {
    // mock
    const gl = createGlMock();
    const vector = buildVector();

    // before
    draw(gl, vector, new Map(), {});

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });

  it('should draw its own stroke normally for an unbound vector, even if a stray outline-style entry exists for its id', () => {
    // mock
    const gl = createGlMock();
    const vector = buildVector();

    // before
    draw(gl, vector, new Map([['a', 'selected']]), {});

    // result
    const lineDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINES);

    expect(lineDraws).toHaveLength(0);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, expect.any(Number));
  });

  it('should draw only the dashed guide outline — no own stroke — for a vector bound (via a committed text node) and being edited', () => {
    // mock
    const gl = createGlMock();
    const vector = buildVector();
    const pathText = buildPathText();

    // before — the dashed guide (LINES) only, its own stroke suppressed to avoid doubling up
    draw(gl, vector, new Map([['a', 'editing']]), { a: vector, 'text-1': pathText });

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expect.any(Number));
  });

  it('should draw the dashed guide outline for a bound vector whose text is merely selected or hovered, same as while editing', () => {
    // mock
    const gl = createGlMock();
    const vector = buildVector();
    const pathText = buildPathText();

    // before — selected (not editing): still the dashed guide, not the plain stroke
    draw(gl, vector, new Map([['a', 'selected']]), { a: vector, 'text-1': pathText });

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expect.any(Number));
  });

  it('should draw only the dashed guide outline for a vector mid-attach, named solely by editingPathId before its text node is committed', () => {
    // mock — attachToVector's startTextEdit fires before any addNode/commitTextNode ever runs
    const gl = createGlMock();
    const vector = buildVector();

    // before — no text node in nodesById yet, only editingPathId names the binding
    draw(gl, vector, new Map([['a', 'editing']]), { a: vector }, 'a');

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINES, 0, expect.any(Number));
  });

  it('should draw nothing at all for a bound vector whose text is committed and completely at rest (not selected, hovered, or editing)', () => {
    // mock — a text-on-path guide is a highlight, not a shape of its own — it stays hidden until
    // its bound text actually needs it shown
    const gl = createGlMock();
    const vector = buildVector();
    const pathText = buildPathText();

    // before — no outline style at all for this id (committed, deselected, unhovered)
    draw(gl, vector, new Map(), { a: vector, 'text-1': pathText });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing while mid-attach either, until an outline style actually names it', () => {
    // mock — editingPathId alone (with no matching entry in pathOutlineStyles) isn't enough on its
    // own; in real use getPathOutlineStyles always sets one together with editingPathId, so this is
    // a defensive case rather than a reachable one
    const gl = createGlMock();
    const vector = buildVector();

    // before
    draw(gl, vector, new Map(), { a: vector }, 'a');

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
