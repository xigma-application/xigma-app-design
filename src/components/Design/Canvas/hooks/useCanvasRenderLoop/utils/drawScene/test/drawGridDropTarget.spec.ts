// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { drawGridDropTarget } from '../drawGridDropTarget/drawGridDropTarget';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
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

const context = (gl: WebGL2RenderingContext): TDrawSceneContext => ({
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: { x: 0, y: 0, zoom: 1 },
});

const gridFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 2,
  gridRowCount: 3,
  height: 300,
  id: 'grid-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 0,
  y: 0,
  ...overrides,
});

const refsWith = (gridDropTarget: { columnStart: number; frameId: string; rowStart: number } | null, draggedIds: string[]): TCanvasRefs =>
  createCanvasRefs({
    transform: {
      draggedNodeIdsRef: { current: draggedIds.length > 0 ? new Set(draggedIds) : null },
      gridDropTargetRef: { current: gridDropTarget },
    },
  });

const strokeCalls = (gl: WebGL2RenderingContext): number =>
  (gl.drawArrays as unknown as { mock: { calls: unknown[][] } }).mock.calls.filter((args) => args[0] === gl.LINE_LOOP).length;

const fillCalls = (gl: WebGL2RenderingContext): number =>
  (gl.drawArrays as unknown as { mock: { calls: unknown[][] } }).mock.calls.filter((args) => args[0] === gl.TRIANGLES).length;

describe('drawGridDropTarget', () => {
  it('should outline every cell and fill the one active drop cell', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame();

    // before
    drawGridDropTarget(context(gl), refsWith({ columnStart: 0, frameId: 'grid-1', rowStart: 0 }, ['a']), { 'grid-1': frame });

    // result — 2 x 3 grid: 6 outlined, 1 filled
    expect(strokeCalls(gl)).toBe(6);
    expect(fillCalls(gl)).toBe(1);
  });

  it('should assume a single dragged node when the dragged-ids ref is empty', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame();

    // before
    drawGridDropTarget(context(gl), refsWith({ columnStart: 0, frameId: 'grid-1', rowStart: 0 }, []), { 'grid-1': frame });

    // result
    expect(strokeCalls(gl)).toBe(6);
    expect(fillCalls(gl)).toBe(1);
  });

  it('should fill one cell per dragged node', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame();

    // before
    drawGridDropTarget(context(gl), refsWith({ columnStart: 0, frameId: 'grid-1', rowStart: 1 }, ['a', 'b']), { 'grid-1': frame });

    // result
    expect(fillCalls(gl)).toBe(2);
  });

  it('should grow the drawn grid by ghost rows when the drop runs past the last cell', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame({ gridColumnCount: 1, gridRowCount: 2 });

    // before — 1 column, 2 rows (2 cells); dropping 3 nodes at index 1 needs rows up to index 3
    drawGridDropTarget(context(gl), refsWith({ columnStart: 0, frameId: 'grid-1', rowStart: 1 }, ['a', 'b', 'c']), { 'grid-1': frame });

    // result — 4 rows drawn, 3 of them active
    expect(strokeCalls(gl)).toBe(4);
    expect(fillCalls(gl)).toBe(3);
  });

  it('should draw nothing when there is no grid drop target', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame();

    // before
    drawGridDropTarget(context(gl), refsWith(null, ['a']), { 'grid-1': frame });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the target frame no longer exists', () => {
    // mock
    const gl = createGlMock();

    // before
    drawGridDropTarget(context(gl), refsWith({ columnStart: 0, frameId: 'ghost', rowStart: 0 }, ['a']), {});

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the target node is not a frame', () => {
    // mock
    const gl = createGlMock();
    const rectangle: TSceneNode = {
      fill: '#000',
      height: 10,
      id: 'grid-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 0,
      y: 0,
    };

    // before
    drawGridDropTarget(context(gl), refsWith({ columnStart: 0, frameId: 'grid-1', rowStart: 0 }, ['a']), { 'grid-1': rectangle });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
