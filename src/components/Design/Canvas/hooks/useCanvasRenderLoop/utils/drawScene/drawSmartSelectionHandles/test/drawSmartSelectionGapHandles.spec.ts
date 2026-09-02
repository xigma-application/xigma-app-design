// types
import { TSmartSelectionGap } from 'types/design/smartSelection/types';

// utils
import { drawSmartSelectionGapHandles } from '../drawSmartSelectionGapHandles';

const drawGapHandleBarMock = vi.fn();
const drawLineMock = vi.fn();

vi.mock('../drawGapHandleBar', () => ({ drawGapHandleBar: (...args: unknown[]): void => drawGapHandleBarMock(...args) }));
vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const gap = (index: number): TSmartSelectionGap => ({
  index,
  midpoint: { x: 0, y: 0 },
  span: { x1: 0, x2: 0, y1: 0, y2: 0 },
  value: 50,
});

describe('drawSmartSelectionGapHandles', () => {
  beforeEach(() => {
    drawGapHandleBarMock.mockClear();
    drawLineMock.mockClear();
  });

  it('should draw a vertical bar per gap for a row layout, with no separator line', () => {
    drawSmartSelectionGapHandles(gl, program, buffer, { gaps: [gap(0), gap(1)], nodes: [], type: 'row' }, 200, 200, IDENTITY_VIEWPORT);

    expect(drawGapHandleBarMock).toHaveBeenCalledTimes(2);
    expect(drawGapHandleBarMock).toHaveBeenCalledWith(gl, program, buffer, gap(0), 'vertical', 200, 200, IDENTITY_VIEWPORT);
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should draw a horizontal bar per gap for a column layout, with no separator line', () => {
    drawSmartSelectionGapHandles(gl, program, buffer, { gaps: [gap(0)], nodes: [], type: 'column' }, 200, 200, IDENTITY_VIEWPORT);

    expect(drawGapHandleBarMock).toHaveBeenCalledWith(gl, program, buffer, gap(0), 'horizontal', 200, 200, IDENTITY_VIEWPORT);
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should draw both bars and full-span separator lines for a grid', () => {
    const layout = {
      cells: [],
      columnCount: 2,
      columnGaps: [gap(0)],
      rowCount: 2,
      rowGaps: [gap(0)],
      type: 'grid' as const,
    };

    drawSmartSelectionGapHandles(gl, program, buffer, layout, 200, 200, IDENTITY_VIEWPORT);

    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawGapHandleBarMock).toHaveBeenCalledTimes(2);
    expect(drawGapHandleBarMock).toHaveBeenCalledWith(gl, program, buffer, gap(0), 'vertical', 200, 200, IDENTITY_VIEWPORT);
    expect(drawGapHandleBarMock).toHaveBeenCalledWith(gl, program, buffer, gap(0), 'horizontal', 200, 200, IDENTITY_VIEWPORT);
  });
});
