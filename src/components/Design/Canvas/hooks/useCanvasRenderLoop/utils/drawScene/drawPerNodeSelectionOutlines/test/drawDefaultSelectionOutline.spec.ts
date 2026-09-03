// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TFrameNode, TPathNode, TSceneNode, TTextNode } from 'types/design/types';

// utils
import { drawDefaultSelectionOutline } from '../drawDefaultSelectionOutline';

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

const buildPathText = (overrides: Partial<TTextNode> = {}): TTextNode => ({
  content: 'Hi',
  fill: '#ffffff',
  flipX: false,
  flipY: false,
  fontFamily: 'Inter',
  fontSize: 14,
  height: 200,
  id: 'a',
  name: 'Text',
  parentId: null,
  pathId: 'ellipse-1',
  pathStartOffset: 0,
  rotation: 0,
  type: NodeType.text,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const draw = (gl: WebGL2RenderingContext, node: Exclude<TBoxSceneNode, TPathNode>, nodesById: Record<string, TSceneNode> = {}): void => {
  const program = {} as WebGLProgram;
  const buffer = {} as WebGLBuffer;

  drawDefaultSelectionOutline(gl, program, buffer, node, 100, 100, IDENTITY_VIEWPORT, nodesById);
};

describe('drawDefaultSelectionOutline', () => {
  it('should draw a bounding-box outline and 4 corner handles for the node', () => {
    // mock
    const gl = createGlMock();
    const node: TFrameNode = {
      fill: '#ff0000',
      height: 10,
      id: 'a',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      childIds: [], clipContent: true, type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    draw(gl, node);

    // result — 1 outline rect + 4 corner handles = 5 LINE_LOOP draws
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should additionally draw the start-offset handle for a selected path-text node', () => {
    // mock
    const gl = createGlMock();
    const pathText = buildPathText();

    // before
    draw(gl, pathText);

    // result
    const fanDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLE_FAN);

    expect(fanDraws).toHaveLength(1);
  });

  it('should additionally draw a dashed font-size guide outline for a selected path-text node', () => {
    // mock
    const gl = createGlMock();
    const pathText = buildPathText();

    // before
    draw(gl, pathText);

    // result
    const lineDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINES);

    expect(lineDraws).toHaveLength(1);
  });

  it('should not draw the start-offset handle for an ordinary (non-path) text node', () => {
    // mock
    const gl = createGlMock();
    const straightText = buildPathText({ pathId: undefined, pathStartOffset: undefined });

    // before
    draw(gl, straightText);

    // result
    const fanDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.TRIANGLE_FAN);

    expect(fanDraws).toHaveLength(0);
  });
});
