// types
import { TGridGeometry, TSmartSelectionGap } from 'types/design/smartSelection/types';

// utils
import { drawSmartSelectionGapHandles } from '../drawSmartSelectionGapHandles';

const drawGapHandleBarMock = vi.fn();

vi.mock('../drawGapHandleBar', () => ({ drawGapHandleBar: (...args: unknown[]): void => drawGapHandleBarMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const gap = (index: number): TSmartSelectionGap => ({
  index,
  midpoint: { x: 0, y: 0 },
  span: { x1: 10, x2: 190, y1: 0, y2: 0 },
  value: 50,
});
const geometry = (cellWidth: number): TGridGeometry => ({
  columnWidth: [cellWidth, cellWidth],
  columnX: [0, 100],
  rowHeight: [10, 10],
  rowY: [0, 100],
});

describe('drawSmartSelectionGapHandles', () => {
  beforeEach(() => {
    drawGapHandleBarMock.mockClear();
  });

  it('should draw a vertical bar per gap for a row layout', () => {
    drawSmartSelectionGapHandles(gl, program, buffer, { gaps: [gap(0), gap(1)], nodes: [], type: 'row' }, 200, 200, IDENTITY_VIEWPORT);

    expect(drawGapHandleBarMock).toHaveBeenCalledTimes(2);
    expect(drawGapHandleBarMock).toHaveBeenCalledWith(gl, program, buffer, gap(0), 'vertical', 200, 200, IDENTITY_VIEWPORT);
  });

  it('should draw a horizontal bar per gap for a column layout', () => {
    drawSmartSelectionGapHandles(gl, program, buffer, { gaps: [gap(0)], nodes: [], type: 'column' }, 200, 200, IDENTITY_VIEWPORT);

    expect(drawGapHandleBarMock).toHaveBeenCalledWith(gl, program, buffer, gap(0), 'horizontal', 200, 200, IDENTITY_VIEWPORT);
  });

  it("should draw a small vertical bar per gap for a grid's column gaps", () => {
    const layout = {
      cells: [],
      columnCount: 2,
      columnGaps: [gap(0), gap(0)],
      geometry: geometry(20),
      rowCount: 2,
      rowGaps: [],
      type: 'grid' as const,
    };

    drawSmartSelectionGapHandles(gl, program, buffer, layout, 200, 200, IDENTITY_VIEWPORT);

    expect(drawGapHandleBarMock).toHaveBeenCalledTimes(2);
    expect(drawGapHandleBarMock).toHaveBeenCalledWith(gl, program, buffer, gap(0), 'vertical', 200, 200, IDENTITY_VIEWPORT);
  });

  it("should inset the row-gap handle from each end by 80% of a cell's width, centred between the insets", () => {
    // span is [10, 190]; uniform cell width 20
    // start = 10 + 0.8*20 = 26; end = 190 - 0.8*20 = 174; length = 148; midpoint = 100
    const layout = {
      cells: [],
      columnCount: 2,
      columnGaps: [],
      geometry: geometry(20),
      rowCount: 2,
      rowGaps: [gap(0)],
      type: 'grid' as const,
    };

    drawSmartSelectionGapHandles(gl, program, buffer, layout, 200, 200, IDENTITY_VIEWPORT);

    expect(drawGapHandleBarMock).toHaveBeenCalledTimes(1);
    expect(drawGapHandleBarMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { ...gap(0), midpoint: { x: 100, y: 0 } },
      'horizontal',
      200,
      200,
      IDENTITY_VIEWPORT,
      148,
    );
  });
});
