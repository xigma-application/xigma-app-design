// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawGradientAddStopHoverPreview } from '../drawGradientAddStopHoverPreview';

const drawGradientAddStopPreviewMock = vi.fn();
const drawGradientStopValueLabelMock = vi.fn();

vi.mock('../drawGradientAddStopPreview', () => ({
  drawGradientAddStopPreview: (...args: unknown[]): void => drawGradientAddStopPreviewMock(...args),
}));
vi.mock('../drawGradientStopValueLabel', () => ({
  drawGradientStopValueLabel: (...args: unknown[]): void => drawGradientStopValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const CONTEXT = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const START = { x: 0, y: 50 };
const END = { x: 100, y: 50 };
const AWAY_FROM_LINE = { x: 0, y: -1 };
const STOPS = [
  { color: '#ffffff', opacity: 100, position: 0 },
  { color: '#000000', opacity: 100, position: 1 },
];

const LINEAR_PAINT: TGradientPaint = { end: { x: 1, y: 0.5 }, opacity: 100, start: { x: 0, y: 0.5 }, stops: STOPS, type: 'gradient-linear' };

describe('drawGradientAddStopHoverPreview', () => {
  beforeEach(() => {
    drawGradientAddStopPreviewMock.mockClear();
    drawGradientStopValueLabelMock.mockClear();
  });

  it('should draw nothing when the line is not hovered', () => {
    // before
    drawGradientAddStopHoverPreview(CONTEXT, BOUNDS, 0, LINEAR_PAINT, START, END, AWAY_FROM_LINE, STOPS, null, createCanvasRefs());

    // result
    expect(drawGradientAddStopPreviewMock).not.toHaveBeenCalled();
  });

  it('should draw nothing while an existing stop is hovered or dragged, even if the line position ref is set', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientLinePositionRef.current = 0.5;

    // action — activeStopIndex is non-null, so the hover ref must be ignored
    drawGradientAddStopHoverPreview(CONTEXT, BOUNDS, 0, LINEAR_PAINT, START, END, AWAY_FROM_LINE, STOPS, 1, refs);

    // result
    expect(drawGradientAddStopPreviewMock).not.toHaveBeenCalled();
  });

  it('should draw the preview above the line, at the interpolated gradient color there, with its value label', () => {
    // before — line runs (0,50) -> (100,50); 0.5 lands at (50, 50), offset up by 18 (zoom 1) -> (50, 32)
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientLinePositionRef.current = 0.5;

    // action
    drawGradientAddStopHoverPreview(CONTEXT, BOUNDS, 0, LINEAR_PAINT, START, END, AWAY_FROM_LINE, STOPS, null, refs);

    // result
    expect(drawGradientAddStopPreviewMock).toHaveBeenCalledTimes(1);

    const [, previewPosition, towardLineDirection, color] = drawGradientAddStopPreviewMock.mock.calls[0];

    expect(previewPosition).toEqual({ x: 50, y: 32 });
    expect(towardLineDirection).toEqual({ x: -AWAY_FROM_LINE.x, y: -AWAY_FROM_LINE.y });
    // stops are white (0%) and black (100%); the midpoint blends to mid-gray
    expect(color).toBe('#808080');

    expect(drawGradientStopValueLabelMock).toHaveBeenCalledWith(CONTEXT, previewPosition, AWAY_FROM_LINE, 0.5);
  });

  it('should push the preview further from the line as zoom decreases, keeping a constant screen-space offset', () => {
    // before
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientLinePositionRef.current = 0;

    // action
    drawGradientAddStopHoverPreview(
      { ...CONTEXT, viewport: { x: 0, y: 0, zoom: 0.5 } },
      BOUNDS,
      0,
      LINEAR_PAINT,
      START,
      END,
      AWAY_FROM_LINE,
      STOPS,
      null,
      refs,
    );

    // result — offset doubles to 36 at half zoom
    const [, previewPosition] = drawGradientAddStopPreviewMock.mock.calls[0];

    expect(previewPosition).toEqual({ x: 0, y: 14 });
  });

  it('should draw the preview around the ellipse, offset outward, for an angular gradient', () => {
    // before — center (50,50), primary axis endpoint (50,100): hover position 0.25 sits on the ellipse
    // at (0,50), offset 18px further left (outward from the center)
    const angularPaint: TGradientPaint = { end: { x: 0.5, y: 1 }, opacity: 100, start: { x: 0.5, y: 0.5 }, stops: STOPS, type: 'gradient-angular' };
    const refs = createCanvasRefs();

    refs.hover.hoveredGradientLinePositionRef.current = 0.25;

    // action
    drawGradientAddStopHoverPreview(
      CONTEXT,
      BOUNDS,
      0,
      angularPaint,
      { x: 50, y: 50 },
      { x: 50, y: 100 },
      AWAY_FROM_LINE,
      STOPS,
      null,
      refs,
    );

    // result
    const [, previewPosition, towardGuideDirection] = drawGradientAddStopPreviewMock.mock.calls[0];

    expect(previewPosition.x).toBeCloseTo(-18, 5);
    expect(previewPosition.y).toBeCloseTo(50, 5);
    // the notch points back inward, toward the ellipse (opposite the outward offset direction)
    expect(towardGuideDirection.x).toBeCloseTo(1, 5);
    expect(towardGuideDirection.y).toBeCloseTo(0, 5);
  });
});
