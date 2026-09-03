// others
import { SMART_SELECTION_SUGGESTION_ICON_CORNER_RADIUS_PX, SMART_SELECTION_SUGGESTION_ICON_FILL } from 'constant/canvas';

// utils
import { drawSmartSelectionSuggestionIcon } from '../drawSmartSelectionSuggestionIcon';

const drawRectMock = vi.fn();
const drawSmartSelectionSuggestionColumnGlyphMock = vi.fn();
const drawSmartSelectionSuggestionGridGlyphMock = vi.fn();
const drawSmartSelectionSuggestionRowGlyphMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('../drawSmartSelectionSuggestionColumnGlyph', () => ({
  drawSmartSelectionSuggestionColumnGlyph: (...args: unknown[]): void => drawSmartSelectionSuggestionColumnGlyphMock(...args),
}));
vi.mock('../drawSmartSelectionSuggestionGridGlyph', () => ({
  drawSmartSelectionSuggestionGridGlyph: (...args: unknown[]): void => drawSmartSelectionSuggestionGridGlyphMock(...args),
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
    drawSmartSelectionSuggestionGridGlyphMock.mockClear();
    drawSmartSelectionSuggestionRowGlyphMock.mockClear();
  });

  it('should draw the rounded-square background then the vertical-bars glyph for a row suggestion', () => {
    drawSmartSelectionSuggestionIcon(gl, program, buffer, rect, 'row', 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledTimes(1);
    expect(drawRectMock.mock.calls[0][3]).toEqual({
      ...rect,
      cornerRadius: SMART_SELECTION_SUGGESTION_ICON_CORNER_RADIUS_PX,
      fill: SMART_SELECTION_SUGGESTION_ICON_FILL,
    });
    expect(drawSmartSelectionSuggestionColumnGlyphMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionRowGlyphMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSuggestionGridGlyphMock).not.toHaveBeenCalled();
  });

  it('should draw the horizontal-bars glyph for a column suggestion', () => {
    drawSmartSelectionSuggestionIcon(gl, program, buffer, rect, 'column', 200, 200, IDENTITY_VIEWPORT);

    expect(drawSmartSelectionSuggestionRowGlyphMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionColumnGlyphMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSuggestionGridGlyphMock).not.toHaveBeenCalled();
  });

  it('should draw the grid glyph for a grid suggestion', () => {
    drawSmartSelectionSuggestionIcon(gl, program, buffer, rect, 'grid', 200, 200, IDENTITY_VIEWPORT);

    expect(drawSmartSelectionSuggestionGridGlyphMock).toHaveBeenCalledTimes(1);
    expect(drawSmartSelectionSuggestionRowGlyphMock).not.toHaveBeenCalled();
    expect(drawSmartSelectionSuggestionColumnGlyphMock).not.toHaveBeenCalled();
  });
});
