// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { drawVectorSelectionOutlineUnlessTextPathGuide } from '../drawVectorSelectionOutlineUnlessTextPathGuide';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
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

const buildVector = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
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
  ...overrides,
});

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 40,
  id: 'text-1',
  name: 'Text',
  parentId: null,
  pathId: 'a',
  rotation: 0,
  type: NodeType.text,
  width: 40,
  x: 0,
  y: 0,
  ...overrides,
});

const draw = (
  gl: WebGL2RenderingContext,
  node: TVectorNode,
  nodesById: Record<string, TSceneNode>,
  editingPathId?: string | null,
): void => {
  const program = {} as WebGLProgram;
  const buffer = {} as WebGLBuffer;

  drawVectorSelectionOutlineUnlessTextPathGuide(gl, program, buffer, node, 100, 100, IDENTITY_VIEWPORT, [], nodesById, editingPathId);
};

describe('drawVectorSelectionOutlineUnlessTextPathGuide', () => {
  it('should draw a bounding-box outline and 4 corner handles for an unbound vector', () => {
    // mock
    const gl = createGlMock();
    const vector = buildVector();

    // before
    draw(gl, vector, {});

    // result — 1 outline rect + 4 corner handles = 5 LINE_LOOP draws
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should draw no selection chrome at all for a vector currently bound as a text-on-path guide, the same as a plain path node', () => {
    // mock
    const gl = createGlMock();
    const vector = buildVector();
    const pathText = buildPathText();

    // before — its own resize-bounding-box outline would otherwise mask a straight/collinear
    // dashed guide (drawn separately in drawSceneNodes.ts), the exact bug this suppresses
    draw(gl, vector, { a: vector, 'text-1': pathText });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should also draw no selection chrome for a vector mid-attach — before its text node is committed, only editingPathId names it', () => {
    // mock — attachToVector dispatches startTextEdit (editingTextBox.pathId) well before any
    // addNode/commitTextNode ever runs, so nodesById alone can't see this binding yet
    const gl = createGlMock();
    const vector = buildVector();

    // before — no text node in nodesById at all yet
    draw(gl, vector, { a: vector }, 'a');

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
