// types
import { TSmartSelectionGridLayout, TSmartSelectionRowLayout } from 'types/design/smartSelection/types';

// utils
import { drawSmartSelectionGapFillPreview } from '../drawSmartSelectionGapFillPreview';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
): { bounds: { height: number; width: number; x: number; y: number }; id: string } => ({
  bounds: { height, width, x, y },
  id,
});

describe('drawSmartSelectionGapFillPreview', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should fill a row layout gap spanning the full height of every node, at the pink-alpha fill', () => {
    const layout: TSmartSelectionRowLayout = {
      gaps: [{ index: 0, midpoint: { x: 75, y: 25 }, span: { x1: 75, x2: 75, y1: 0, y2: 50 }, value: 50 }],
      nodes: [node('a', 0, 0, 50, 50), node('b', 100, 0, 50, 50)],
      type: 'row',
    };

    drawSmartSelectionGapFillPreview(gl, program, buffer, layout, 'x', 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledTimes(1);
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ff2fc2', fillAlpha: 0.3, height: 50, width: 50, x: 50, y: 0 },
      200,
      200,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it("should fill each row's own column gap separately for a grid drag along the x axis, instead of merging across the whole grid height", () => {
    const layout: TSmartSelectionGridLayout = {
      cells: [
        [node('a', 0, 0, 50, 50), node('b', 100, 0, 50, 50)],
        [node('c', 0, 100, 50, 50), node('d', 100, 100, 50, 50)],
      ],
      columnCount: 2,
      columnGaps: [
        { index: 0, midpoint: { x: 75, y: 25 }, span: { x1: 75, x2: 75, y1: 0, y2: 150 }, value: 50 },
        { index: 0, midpoint: { x: 75, y: 125 }, span: { x1: 75, x2: 75, y1: 0, y2: 150 }, value: 50 },
      ],
      geometry: { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [{ index: 0, midpoint: { x: 75, y: 75 }, span: { x1: 0, x2: 150, y1: 75, y2: 75 }, value: 50 }],
      type: 'grid',
    };

    drawSmartSelectionGapFillPreview(gl, program, buffer, layout, 'x', 200, 200, IDENTITY_VIEWPORT);

    // result — two separate fills, one per row, each only as tall as that row's own cells
    expect(drawRectMock).toHaveBeenCalledTimes(2);
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ff2fc2', fillAlpha: 0.3, height: 50, width: 50, x: 50, y: 0 },
      200,
      200,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ff2fc2', fillAlpha: 0.3, height: 50, width: 50, x: 50, y: 100 },
      200,
      200,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should fill the row gap spanning the full width of the grid for a drag along the y axis', () => {
    const layout: TSmartSelectionGridLayout = {
      cells: [
        [node('a', 0, 0, 50, 50), node('b', 100, 0, 50, 50)],
        [node('c', 0, 100, 50, 50), node('d', 100, 100, 50, 50)],
      ],
      columnCount: 2,
      columnGaps: [{ index: 0, midpoint: { x: 75, y: 75 }, span: { x1: 75, x2: 75, y1: 0, y2: 150 }, value: 50 }],
      geometry: { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [{ index: 0, midpoint: { x: 75, y: 75 }, span: { x1: 0, x2: 150, y1: 75, y2: 75 }, value: 50 }],
      type: 'grid',
    };

    drawSmartSelectionGapFillPreview(gl, program, buffer, layout, 'y', 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledTimes(1);
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ff2fc2', fillAlpha: 0.3, height: 50, width: 150, x: 0, y: 50 },
      200,
      200,
      IDENTITY_VIEWPORT,
      0,
    );
  });
});
