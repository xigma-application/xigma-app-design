// utils
import { drawEllipseArcStartValueLabel } from '../drawEllipseArcStartValueLabel';

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

describe('drawEllipseArcStartValueLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw a "Start 0°" badge at the rest state, offset at a fixed 45° from the handle, in the same blue used for the draft frame stroke', () => {
    // before — the handle sits at (100, 50), straight right of the center (50, 50); arcStartAngle at its default (90)
    drawEllipseArcStartValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, 90);

    // result
    const [, , , , text, anchor, direction, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('Start 0°');
    expect(anchor.x).toBeCloseTo(100 + 4 * DIAGONAL);
    expect(anchor.y).toBeCloseTo(50 - 4 * DIAGONAL);
    expect(direction.x).toBeCloseTo(DIAGONAL);
    expect(direction.y).toBeCloseTo(-DIAGONAL);
    expect(options.fill).toBe('#337ae1');
  });

  it('should draw a live "Start N°" badge once rotated away from the rest state', () => {
    // before
    drawEllipseArcStartValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, -90);

    // result
    const [, , , , text] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('Start -180°');
  });
});
