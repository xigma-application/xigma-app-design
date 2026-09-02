// utils
import { drawStarRatioValueLabel } from '../drawStarRatioValueLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

describe('drawStarRatioValueLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw a one-decimal "Ratio N%" badge offset outward from the handle, in the same blue used for the draft frame stroke', () => {
    // before — the handle sits at (100, 50), straight right of the center (50, 50); ratio 0.382 -> 38.2%
    drawStarRatioValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, 0.382);

    // result
    const [, , , , text, anchor, direction, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('Ratio 38.2%');
    expect(anchor.x).toBeCloseTo(104);
    expect(anchor.y).toBeCloseTo(50);
    expect(direction.x).toBeCloseTo(1);
    expect(direction.y).toBeCloseTo(0);
    expect(options.fill).toBe('#337ae1');
  });

  it('should render 0% and 100% at the extremes', () => {
    // before
    drawStarRatioValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, 0);
    drawStarRatioValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, 1);

    // result
    expect(drawValueLabelMock.mock.calls[0][4]).toBe('Ratio 0.0%');
    expect(drawValueLabelMock.mock.calls[1][4]).toBe('Ratio 100.0%');
  });
});
