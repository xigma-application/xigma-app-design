// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { drawSmartSelectionSwapHandles } from '../drawSmartSelectionSwapHandles';

const drawSwapHandleDotMock = vi.fn();
const drawSwapHandleRingMock = vi.fn();

vi.mock('../drawSwapHandleDot', () => ({ drawSwapHandleDot: (...args: unknown[]): void => drawSwapHandleDotMock(...args) }));
vi.mock('../drawSwapHandleRing', () => ({ drawSwapHandleRing: (...args: unknown[]): void => drawSwapHandleRingMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const node = (id: string, x: number, y: number): TSmartSelectionNode => ({ bounds: { height: 40, width: 40, x, y }, id });

describe('drawSmartSelectionSwapHandles', () => {
  beforeEach(() => {
    drawSwapHandleDotMock.mockClear();
    drawSwapHandleRingMock.mockClear();
  });

  it('should draw a hollow ring per node, centred in its bounds, for a row layout inside the active box', () => {
    const layout = { gaps: [], nodes: [node('a', 0, 0), node('b', 100, 0)], type: 'row' as const };

    drawSmartSelectionSwapHandles(gl, program, buffer, layout, true, null, 200, 200, IDENTITY_VIEWPORT);

    expect(drawSwapHandleDotMock).not.toHaveBeenCalled();
    expect(drawSwapHandleRingMock).toHaveBeenCalledTimes(2);
    expect(drawSwapHandleRingMock).toHaveBeenCalledWith(gl, program, buffer, 20, 20, false, 200, 200, IDENTITY_VIEWPORT);
  });

  it('should draw a ring per cell for a grid layout inside the active box', () => {
    const layout = {
      cells: [[node('a', 0, 0), node('b', 100, 0)]],
      columnCount: 2,
      columnGaps: [],
      rowCount: 1,
      rowGaps: [],
      type: 'grid' as const,
    };

    drawSmartSelectionSwapHandles(gl, program, buffer, layout, true, null, 200, 200, IDENTITY_VIEWPORT);

    expect(drawSwapHandleRingMock).toHaveBeenCalledTimes(2);
  });

  it('should fill only the ring whose centre matches the hovered swap point', () => {
    const layout = { gaps: [], nodes: [node('a', 0, 0), node('b', 100, 0)], type: 'row' as const };

    drawSmartSelectionSwapHandles(gl, program, buffer, layout, true, { x: 120, y: 20 }, 200, 200, IDENTITY_VIEWPORT);

    expect(drawSwapHandleRingMock).toHaveBeenNthCalledWith(1, gl, program, buffer, 20, 20, false, 200, 200, IDENTITY_VIEWPORT);
    expect(drawSwapHandleRingMock).toHaveBeenNthCalledWith(2, gl, program, buffer, 120, 20, true, 200, 200, IDENTITY_VIEWPORT);
  });

  it('should draw the bordered dot per node instead of the ring while the box is not active', () => {
    const layout = { gaps: [], nodes: [node('a', 0, 0), node('b', 100, 0)], type: 'row' as const };

    drawSmartSelectionSwapHandles(gl, program, buffer, layout, false, null, 200, 200, IDENTITY_VIEWPORT);

    expect(drawSwapHandleRingMock).not.toHaveBeenCalled();
    expect(drawSwapHandleDotMock).toHaveBeenCalledTimes(2);
    expect(drawSwapHandleDotMock).toHaveBeenCalledWith(gl, program, buffer, 20, 20, 200, 200, IDENTITY_VIEWPORT);
  });
});
