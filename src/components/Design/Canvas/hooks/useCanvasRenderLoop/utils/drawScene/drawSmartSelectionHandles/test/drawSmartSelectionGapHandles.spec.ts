// types
import { TSmartSelectionGap } from 'types/design/smartSelection/types';

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
const cell = (width: number): { bounds: { height: number; width: number; x: number; y: number }; id: string } => ({
  bounds: { height: 10, width, x: 0, y: 0 },
  id: 'n',
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

  it("should draw a small vertical bar per row for a grid's column gaps", () => {
    const layout = {
      cells: [[cell(20), cell(30)]],
      columnCount: 2,
      columnGaps: [gap(0), gap(0)],
      rowCount: 2,
      rowGaps: [],
      type: 'grid' as const,
    };

    drawSmartSelectionGapHandles(gl, program, buffer, layout, 200, 200, IDENTITY_VIEWPORT);

    expect(drawGapHandleBarMock).toHaveBeenCalledTimes(2);
    expect(drawGapHandleBarMock).toHaveBeenCalledWith(gl, program, buffer, gap(0), 'vertical', 200, 200, IDENTITY_VIEWPORT);
  });

  it("should inset the row-gap handle from each end by 80% of that end column's width, centred between the insets", () => {
    // span is [10, 190]; first column width 20, last column width 30
    // start = 10 + 0.8*20 = 26; end = 190 - 0.8*30 = 166; length = 140; midpoint = 96
    const layout = {
      cells: [[cell(20), cell(30)]],
      columnCount: 2,
      columnGaps: [],
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
      { ...gap(0), midpoint: { x: 96, y: 0 } },
      'horizontal',
      200,
      200,
      IDENTITY_VIEWPORT,
      140,
    );
  });
});
