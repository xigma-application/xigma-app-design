// others
import { SMART_SELECTION_SUGGESTION_ICON_BAR_FILL } from 'constant/canvas';

// utils
import { drawSmartSelectionSuggestionRowGlyph } from '../drawSmartSelectionSuggestionRowGlyph';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const rect = { height: 24, width: 24, x: 0, y: 0 };

describe('drawSmartSelectionSuggestionRowGlyph', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw 3 evenly-stacked horizontal bars, centred in the icon rect', () => {
    drawSmartSelectionSuggestionRowGlyph(gl, program, buffer, rect, 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledTimes(3);

    const bars = drawRectMock.mock.calls.map((call) => call[3]);

    bars.forEach((bar) => {
      expect(bar.fill).toBe(SMART_SELECTION_SUGGESTION_ICON_BAR_FILL);
      expect(bar.width).toBe(14);
      expect(bar.height).toBe(2);
      expect(bar.x).toBe(12 - 7);
    });

    // 3 bars of height 2 with 3px gaps => total 12, centred in 24 => starts at 6
    expect(bars[0].y).toBe(6);
    expect(bars[1].y).toBe(11);
    expect(bars[2].y).toBe(16);
  });

  it('should keep a constant screen size regardless of zoom', () => {
    drawSmartSelectionSuggestionRowGlyph(gl, program, buffer, rect, 200, 200, { x: 0, y: 0, zoom: 2 });

    expect(drawRectMock.mock.calls[0][3].width).toBe(7);
  });
});
