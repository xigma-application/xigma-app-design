// types
import { NodeType } from 'types/design/enums';
import { TBoxSceneNode, TMediaNode, TPathNode, TPolygonNode, TSceneNode, TSectionNode, TStarNode, TTextNode } from 'types/design/types';

// utils
import { drawSelectionOutline } from '../drawSelectionOutline';

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
const refs = { smartSelection: { swapDragRef: { current: null } } } as never;

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

describe('drawSelectionOutline', () => {
  it('should draw nothing when there is no selection', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;

    // before
    drawSelectionOutline(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      [],
      [],
      {},
      refs,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw one shared outline for a same-parent multi-selection', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', x: 0, y: 0 }), buildNode({ id: 'b', x: 40, y: 0 })];

    // before
    drawSelectionOutline(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      [],
      {},
      refs,
    );

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should draw a separate outline per node for a single selection', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', x: 0, y: 0 })];

    // before
    drawSelectionOutline(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      [],
      {},
      refs,
    );

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });

  it('should draw nothing for a multi-selection whose nodes are all currently open in Vector Edit Mode', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', x: 0, y: 0 }), buildNode({ id: 'b', x: 40, y: 0 })];

    // before
    drawSelectionOutline(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      ['a', 'b'],
      {},
      refs,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing while a Smart Selection swap drag is in progress', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', x: 0, y: 0 }), buildNode({ id: 'b', x: 40, y: 0 })];

    // before
    drawSelectionOutline(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      [],
      {},
      { smartSelection: { swapDragRef: { current: {} } } } as never,
    );

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw a per-node outline only for the nodes not currently open in Vector Edit Mode', () => {
    // mock
    const gl = createGlMock();
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const nodes = [buildNode({ id: 'a', x: 0, y: 0 }), buildNode({ id: 'b', x: 40, y: 0 })];

    // before
    drawSelectionOutline(
      { buffer, canvasHeight: 100, canvasWidth: 100, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      nodes,
      ['a'],
      {},
      refs,
    );

    // result
    const lineLoopDraws = (gl.drawArrays as ReturnType<typeof vi.fn>).mock.calls.filter(([mode]) => mode === gl.LINE_LOOP);

    expect(lineLoopDraws).toHaveLength(5);
  });
});
