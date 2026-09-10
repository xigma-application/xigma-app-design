// hooks
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs, TGridDropTargetHover } from 'types/design/canvas/types';
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

const refsWith = (gridDropTarget: TGridDropTargetHover | null): TCanvasRefs =>
  createCanvasRefs({ transform: { gridDropTargetRef: { current: gridDropTarget } } });

const drawCalls = (gl: WebGL2RenderingContext, mode: number): number =>
  (gl.drawArrays as unknown as { mock: { calls: unknown[][] } }).mock.calls.filter((args) => args[0] === mode).length;

describe('drawGridDropTarget', () => {
  it('should outline every cell and fill each resolved drop cell', () => {
    // mock
    const gl = createGlMock();

    // before
    drawGridDropTarget(
      context(gl),
      refsWith({
        cells: [
          { column: 0, row: 0 },
          { column: 1, row: 0 },
        ],
        frameId: 'grid-1',
      }),
      { 'grid-1': gridFrame() },
    );

    // result — 2 x 3 grid: 6 outlined, 2 filled
    expect(drawCalls(gl, gl.LINE_LOOP)).toBe(6);
    expect(drawCalls(gl, gl.TRIANGLES)).toBe(2);
  });

  it('should not draw ghost rows for cells that overflow the grid — the grid only grows on drop', () => {
    // mock — 1 x 2 grid; one resolved cell is in range (row 1), one overflows (row 3)
    const gl = createGlMock();

    // before
    drawGridDropTarget(
      context(gl),
      refsWith({
        cells: [
          { column: 0, row: 1 },
          { column: 0, row: 3 },
        ],
        frameId: 'grid-1',
      }),
      { 'grid-1': gridFrame({ gridColumnCount: 1, gridRowCount: 2 }) },
    );

    // result — only the 2 real rows, and only the in-range cell is filled
    expect(drawCalls(gl, gl.LINE_LOOP)).toBe(2);
    expect(drawCalls(gl, gl.TRIANGLES)).toBe(1);
  });

  it('should draw nothing when there is no grid drop target', () => {
    // mock
    const gl = createGlMock();

    // before
    drawGridDropTarget(context(gl), refsWith(null), { 'grid-1': gridFrame() });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the target frame no longer exists', () => {
    // mock
    const gl = createGlMock();

    // before
    drawGridDropTarget(context(gl), refsWith({ cells: [{ column: 0, row: 0 }], frameId: 'ghost' }), {});

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
    drawGridDropTarget(context(gl), refsWith({ cells: [{ column: 0, row: 0 }], frameId: 'grid-1' }), { 'grid-1': rectangle });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
