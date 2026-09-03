// others
import { SMART_SELECTION_SUGGESTION_ICON_BAR_FILL } from 'constant/canvas';

// utils
import { drawSmartSelectionSuggestionColumnGlyph } from '../drawSmartSelectionSuggestionColumnGlyph';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const rect = { height: 24, width: 24, x: 0, y: 0 };

describe('drawSmartSelectionSuggestionColumnGlyph', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it('should draw 3 evenly-spaced vertical bars, centred in the icon rect', () => {
    drawSmartSelectionSuggestionColumnGlyph(gl, program, buffer, rect, 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledTimes(3);

    const bars = drawRectMock.mock.calls.map((call) => call[3]);

    bars.forEach((bar) => {
      expect(bar.fill).toBe(SMART_SELECTION_SUGGESTION_ICON_BAR_FILL);
      expect(bar.height).toBe(14);
      expect(bar.width).toBe(2);
      expect(bar.y).toBe(12 - 7);
    });

    // 3 bars of width 2 with 3px gaps => total 12, centred in 24 => starts at 6
    expect(bars[0].x).toBe(6);
    expect(bars[1].x).toBe(11);
    expect(bars[2].x).toBe(16);
  });

  it('should keep a constant screen size regardless of zoom', () => {
    drawSmartSelectionSuggestionColumnGlyph(gl, program, buffer, rect, 200, 200, { x: 0, y: 0, zoom: 2 });

    expect(drawRectMock.mock.calls[0][3].height).toBe(7);
  });
});
