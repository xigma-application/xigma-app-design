// utils
import { drawEllipseArcValueLabel } from '../drawEllipseArcValueLabel';

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

describe('drawEllipseArcValueLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw an "Arc" badge at the full-circle rest state, offset at a fixed 45° from the handle, in the same blue used for the draft frame stroke', () => {
    // before — the handle sits at (100, 50), straight right of the center (50, 50); arcStartAngle === arcEndAngle
    drawEllipseArcValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, 90, 90);

    // result
    const [, , , , text, anchor, direction, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('Arc');
    expect(anchor.x).toBeCloseTo(100 + 4 * DIAGONAL);
    expect(anchor.y).toBeCloseTo(50 - 4 * DIAGONAL);
    expect(direction.x).toBeCloseTo(DIAGONAL);
    expect(direction.y).toBeCloseTo(-DIAGONAL);
    expect(options.fill).toBe('#337ae1');
  });

  it('should draw a live "Sweep N%" badge once the circle is cut away from the rest state', () => {
    // before
    drawEllipseArcValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, 0, 90);

    // result
    const [, , , , text] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('Sweep 75.0%');
  });
});
