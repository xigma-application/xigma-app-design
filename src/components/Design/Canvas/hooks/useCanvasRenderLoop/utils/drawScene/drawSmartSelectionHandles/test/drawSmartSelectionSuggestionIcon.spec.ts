// others
import { SMART_SELECTION_SUGGESTION_ICON_CORNER_RADIUS_PX, SMART_SELECTION_SUGGESTION_ICON_FILL } from 'constant/canvas';

// utils
import { drawSmartSelectionSuggestionIcon } from '../drawSmartSelectionSuggestionIcon';

const drawRectMock = vi.fn();
const drawSmartSelectionSuggestionColumnGlyphMock = vi.fn();
const drawSmartSelectionSuggestionRowGlyphMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('../drawSmartSelectionSuggestionColumnGlyph', () => ({
  drawSmartSelectionSuggestionColumnGlyph: (...args: unknown[]): void => drawSmartSelectionSuggestionColumnGlyphMock(...args),
}));
vi.mock('../drawSmartSelectionSuggestionRowGlyph', () => ({
  drawSmartSelectionSuggestionRowGlyph: (...args: unknown[]): void => drawSmartSelectionSuggestionRowGlyphMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const rect = { height: 24, width: 24, x: 100, y: 100 };

describe('drawSmartSelectionSuggestionIcon', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
    drawSmartSelectionSuggestionColumnGlyphMock.mockClear();
    drawSmartSelectionSuggestionRowGlyphMock.mockClear();
  });

  it('should draw the rounded-square background then the row glyph for a row suggestion', () => {
    drawSmartSelectionSuggestionIcon(gl, program, buffer, rect, 'x', 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledTimes(1);
    expect(drawRectMock.mock.calls[0][3]).toEqual({
      ...rect,
      cornerRadius: SMART_SELECTION_SUGGESTION_ICON_CORNER_RADIUS_PX,
      fill: SMART_SELECTION_SUGGESTION_ICON_FILL,
    });
    expect(drawSmartSelectionSuggestionRowGlyphMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionColumnGlyphMock).not.toHaveBeenCalled();
  });

  it('should draw the column glyph for a column suggestion', () => {
    drawSmartSelectionSuggestionIcon(gl, program, buffer, rect, 'y', 200, 200, IDENTITY_VIEWPORT);

    expect(drawSmartSelectionSuggestionColumnGlyphMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionRowGlyphMock).not.toHaveBeenCalled();
  });
});
