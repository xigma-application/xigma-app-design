// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TDrawSceneContext } from '../types';

// utils
import { drawGridSectionHighlight } from '../drawGridSectionHighlight/drawGridSectionHighlight';

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

describe('drawGridSectionHighlight', () => {
  it('should fill every highlighted cell and stroke one enclosing outline', () => {
    const gl = createGlMock();
    const frame = gridFrame();

    drawGridSectionHighlight(
      context(gl),
      {
        cells: [
          { column: 1, row: 0 },
          { column: 1, row: 1 },
          { column: 1, row: 2 },
        ],
        frameId: 'frame-1',
      },
      { 'frame-1': frame },
    );

    // 3 cell fills (TRIANGLES) + 1 thick outline (TRIANGLES) = 4 draws, all triangles, no LINE_LOOP
    expect(gl.drawArrays).toHaveBeenCalledTimes(4);
    expect(gl.drawArrays).not.toHaveBeenCalledWith(gl.LINE_LOOP, expect.anything(), expect.anything());
  });

  it('should still draw for a rotated grid frame', () => {
    const gl = createGlMock();
    const frame = gridFrame({ rotation: 30 });

    drawGridSectionHighlight(context(gl), { cells: [{ column: 0, row: 0 }], frameId: 'frame-1' }, { 'frame-1': frame });

    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it('should draw nothing when the highlight is null', () => {
    const gl = createGlMock();

    drawGridSectionHighlight(context(gl), null, {});

    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the frame is missing', () => {
    const gl = createGlMock();

    drawGridSectionHighlight(context(gl), { cells: [{ column: 0, row: 0 }], frameId: 'gone' }, {});

    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the referenced node is not a grid frame', () => {
    const gl = createGlMock();
    const frame = gridFrame({ layoutMode: LayoutMode.horizontal });

    drawGridSectionHighlight(context(gl), { cells: [{ column: 0, row: 0 }], frameId: 'frame-1' }, { 'frame-1': frame });

    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when no highlighted cell is inside the grid', () => {
    const gl = createGlMock();
    const frame = gridFrame();

    drawGridSectionHighlight(context(gl), { cells: [{ column: 9, row: 9 }], frameId: 'frame-1' }, { 'frame-1': frame });

    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
