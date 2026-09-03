// others
import { SMART_SELECTION_SWAP_HANDLE_FILL, SMART_SELECTION_SWAP_HANDLE_RADIUS_PX } from 'constant/canvas';

// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { drawSmartSelectionSwapHandles } from '../drawSmartSelectionSwapHandles';

const drawEllipseMock = vi.fn();
const drawSwapHandleDotMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('../drawSwapHandleDot', () => ({ drawSwapHandleDot: (...args: unknown[]): void => drawSwapHandleDotMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const node = (id: string, x: number, y: number): TSmartSelectionNode => ({ bounds: { height: 40, width: 40, x, y }, id });

describe('drawSmartSelectionSwapHandles', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawSwapHandleDotMock.mockClear();
  });

  it('should draw one plain dot per node, centred in its bounds, for a row layout inside the active box', () => {
    const layout = { gaps: [], nodes: [node('a', 0, 0), node('b', 100, 0)], type: 'row' as const };

    drawSmartSelectionSwapHandles(gl, program, buffer, layout, true, 200, 200, IDENTITY_VIEWPORT);

    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      {
        fill: SMART_SELECTION_SWAP_HANDLE_FILL,
        height: SMART_SELECTION_SWAP_HANDLE_RADIUS_PX * 2,
        width: SMART_SELECTION_SWAP_HANDLE_RADIUS_PX * 2,
        x: 20 - SMART_SELECTION_SWAP_HANDLE_RADIUS_PX,
        y: 20 - SMART_SELECTION_SWAP_HANDLE_RADIUS_PX,
      },
      200,
      200,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw one plain dot per cell for a grid layout inside the active box', () => {
    const layout = {
      cells: [[node('a', 0, 0), node('b', 100, 0)]],
      columnCount: 2,
      columnGaps: [],
      rowCount: 1,
      rowGaps: [],
      type: 'grid' as const,
    };

    drawSmartSelectionSwapHandles(gl, program, buffer, layout, true, 200, 200, IDENTITY_VIEWPORT);

    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
  });

  it('should shrink the plain dot screen-radius as zoom increases', () => {
    const layout = { gaps: [], nodes: [node('a', 0, 0)], type: 'row' as const };

    drawSmartSelectionSwapHandles(gl, program, buffer, layout, true, 200, 200, { x: 0, y: 0, zoom: 4 });

    const [[, , , ellipse]] = drawEllipseMock.mock.calls;

    expect(ellipse.width).toBeCloseTo((SMART_SELECTION_SWAP_HANDLE_RADIUS_PX * 2) / 4);
  });

  it('should draw the bordered dot per node instead of the plain dot while the box is not active', () => {
    const layout = { gaps: [], nodes: [node('a', 0, 0), node('b', 100, 0)], type: 'row' as const };

    drawSmartSelectionSwapHandles(gl, program, buffer, layout, false, 200, 200, IDENTITY_VIEWPORT);

    expect(drawEllipseMock).not.toHaveBeenCalled();
    expect(drawSwapHandleDotMock).toHaveBeenCalledTimes(2);
    expect(drawSwapHandleDotMock).toHaveBeenCalledWith(gl, program, buffer, 20, 20, 200, 200, IDENTITY_VIEWPORT);
  });
});
