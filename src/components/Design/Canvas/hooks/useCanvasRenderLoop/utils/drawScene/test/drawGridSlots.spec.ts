// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawGridSlots } from '../drawGridSlots/drawGridSlots';

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

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const context = (gl: WebGL2RenderingContext): TDrawSceneContext => ({
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
});

const gridFrame = (overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  gridColumnCount: 2,
  gridRowCount: 3,
  height: 300,
  id: 'frame-1',
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

const rectangle: TRectangleNode = {
  fill: '#000',
  height: 20,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
};

describe('drawGridSlots', () => {
  it('should stroke one rectangle per cell for a selected grid frame', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame();

    // before
    drawGridSlots(context(gl), [frame], { 'frame-1': frame });

    // result — 2 columns x 3 rows
    expect(gl.drawArrays).toHaveBeenCalledTimes(6);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.LINE_LOOP, 0, 4);
  });

  it('should still draw every cell for a rotated grid frame', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame({ rotation: 30 });

    // before
    drawGridSlots(context(gl), [frame], { 'frame-1': frame });

    // result
    expect(gl.drawArrays).toHaveBeenCalledTimes(6);
  });

  it('should draw nothing when nothing is selected', () => {
    // mock
    const gl = createGlMock();

    // before
    drawGridSlots(context(gl), [], {});

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when more than one node is selected', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame();

    // before
    drawGridSlots(context(gl), [frame, rectangle], { 'frame-1': frame, 'rect-1': rectangle });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected node is not a grid frame', () => {
    // mock
    const gl = createGlMock();
    const frame = gridFrame({ layoutMode: LayoutMode.horizontal });

    // before
    drawGridSlots(context(gl), [frame], { 'frame-1': frame });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the selected node is a plain shape', () => {
    // mock
    const gl = createGlMock();

    // before
    drawGridSlots(context(gl), [rectangle as unknown as TSceneNode], { 'rect-1': rectangle });

    // result
    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
