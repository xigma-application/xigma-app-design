// utils
import { drawEllipseArcRatioValueLabel } from '../drawEllipseArcRatioValueLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };
const DIAGONAL = Math.SQRT1_2; // cos(45°) === sin(45°)
const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

describe('drawEllipseArcRatioValueLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw a "Ratio N%" badge offset at a fixed 45° from the handle, in the same blue used for the draft frame stroke', () => {
    // before — the handle sits at (100, 50), straight right of the center (50, 50)
    drawEllipseArcRatioValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, 0.285);

    // result
    const [, , , , text, anchor, direction, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('Ratio 28.5%');
    expect(anchor.x).toBeCloseTo(100 + 4 * DIAGONAL);
    expect(anchor.y).toBeCloseTo(50 - 4 * DIAGONAL);
    expect(direction.x).toBeCloseTo(DIAGONAL);
    expect(direction.y).toBeCloseTo(-DIAGONAL);
    expect(options.fill).toBe('#337ae1');
  });
});
