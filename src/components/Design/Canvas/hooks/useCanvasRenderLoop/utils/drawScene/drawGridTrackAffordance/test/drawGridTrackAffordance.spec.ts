// store
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../../types';
import { TFrameNode } from 'types/design/types';

// utils
import { drawGridTrackAffordance } from '../drawGridTrackAffordance';

const createGlMock = (): WebGL2RenderingContext =>
  ({
    LINE_LOOP: 2,
    STATIC_DRAW: 35044,
    TRIANGLE_FAN: 6,
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
  gridColumnCount: 3,
  height: 200,
  id: 'frame-1',
  layoutMode: LayoutMode.grid,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 300,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawGridTrackAffordance', () => {
  it('should draw both the column and row pills for the hovered cell', () => {
    const gl = createGlMock();
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = { columnIndex: 1, frameId: 'frame-1', rowIndex: 0 };

    drawGridTrackAffordance(context(gl), [frame], refs, { 'frame-1': frame });

    // 2 pills x 2 rects (border + fill) each = 4 draws
    expect(gl.drawArrays).toHaveBeenCalledTimes(4);
  });

  it('should still draw when the hovered index is stale and past the resolved tracks', () => {
    const gl = createGlMock();
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = { columnIndex: 99, frameId: 'frame-1', rowIndex: 99 };

    expect(() => drawGridTrackAffordance(context(gl), [frame], refs, { 'frame-1': frame })).not.toThrow();
    expect(gl.drawArrays).toHaveBeenCalledTimes(4);
  });

  it('should draw nothing when there is no hover state', () => {
    const gl = createGlMock();
    const frame = gridFrame();
    const refs = createCanvasRefs();

    drawGridTrackAffordance(context(gl), [frame], refs, { 'frame-1': frame });

    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when the hover state belongs to a different frame', () => {
    const gl = createGlMock();
    const frame = gridFrame();
    const refs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = { columnIndex: 0, frameId: 'other-frame', rowIndex: 0 };

    drawGridTrackAffordance(context(gl), [frame], refs, { 'frame-1': frame });

    expect(gl.drawArrays).not.toHaveBeenCalled();
  });

  it('should draw nothing when no grid frame is selected', () => {
    const gl = createGlMock();
    const refs: TCanvasRefs = createCanvasRefs();

    refs.hover.hoveredGridTrackAffordanceRef.current = { columnIndex: 0, frameId: 'frame-1', rowIndex: 0 };

    drawGridTrackAffordance(context(gl), [], refs, {});

    expect(gl.drawArrays).not.toHaveBeenCalled();
  });
});
