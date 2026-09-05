// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { drawGridColumnGapFills } from '../drawGridColumnGapFills';

const drawFillRectMock = vi.fn();

vi.mock('../drawFillRect', () => ({
  drawFillRect: (...args: unknown[]): void => drawFillRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const node = (id: string): TSmartSelectionNode => ({ bounds: { height: 50, width: 50, x: 0, y: 0 }, id });

describe('drawGridColumnGapFills', () => {
  beforeEach(() => {
    drawFillRectMock.mockClear();
  });

  it('should draw a fill rect spanning the gap between two adjacent populated cells in a row', () => {
    const geometry = { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50], rowY: [0] };

    drawGridColumnGapFills(gl, program, buffer, [[node('a'), node('b')]], geometry, 200, 200, IDENTITY_VIEWPORT);

    expect(drawFillRectMock).toHaveBeenCalledTimes(1);
    expect(drawFillRectMock).toHaveBeenCalledWith(gl, program, buffer, { height: 50, width: 50, x: 50, y: 0 }, 200, 200, IDENTITY_VIEWPORT);
  });

  it('should skip a column pair when either side is an empty cell', () => {
    const geometry = { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50], rowY: [0] };

    drawGridColumnGapFills(gl, program, buffer, [[null, node('b')]], geometry, 200, 200, IDENTITY_VIEWPORT);

    expect(drawFillRectMock).not.toHaveBeenCalled();
  });

  it('should draw one fill per row, independently, across multiple rows', () => {
    const geometry = { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] };

    drawGridColumnGapFills(
      gl,
      program,
      buffer,
      [
        [node('a'), node('b')],
        [node('c'), node('d')],
      ],
      geometry,
      200,
      200,
      IDENTITY_VIEWPORT,
    );

    expect(drawFillRectMock).toHaveBeenCalledTimes(2);
  });
});
