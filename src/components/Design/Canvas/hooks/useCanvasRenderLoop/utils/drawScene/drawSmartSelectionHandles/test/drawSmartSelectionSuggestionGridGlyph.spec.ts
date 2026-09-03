// others
import { SMART_SELECTION_SUGGESTION_ICON_GRID_DOT_FILL } from 'constant/canvas';

// utils
import { drawSmartSelectionSuggestionGridGlyph } from '../drawSmartSelectionSuggestionGridGlyph';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const rect = { height: 24, width: 24, x: 0, y: 0 };

describe('drawSmartSelectionSuggestionGridGlyph', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw a 3x3 grid of small squares, centred in the icon rect', () => {
    drawSmartSelectionSuggestionGridGlyph(gl, program, buffer, rect, 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledTimes(9);

    const squares = drawRectMock.mock.calls.map((call) => call[3]);

    squares.forEach((square) => {
      expect(square.fill).toBe(SMART_SELECTION_SUGGESTION_ICON_GRID_DOT_FILL);
      expect(square.width).toBe(2);
      expect(square.height).toBe(2);
    });

    // 3 squares of 2px with 2px gaps => total 10, centred in 24 => starts at 7
    expect(squares[0]).toMatchObject({ x: 7, y: 7 });
    expect(squares[1]).toMatchObject({ x: 11, y: 7 });
    expect(squares[8]).toMatchObject({ x: 15, y: 15 });
  });

  it('should keep a constant screen size regardless of zoom', () => {
    drawSmartSelectionSuggestionGridGlyph(gl, program, buffer, rect, 200, 200, { x: 0, y: 0, zoom: 2 });

    expect(drawRectMock.mock.calls[0][3].width).toBe(1);
  });
});
