// utils
import { drawStarCornerRadiusValueLabel } from '../drawStarCornerRadiusValueLabel';
import { getStarCornerRadiusValueLabelAnchor } from '../getStarCornerRadiusValueLabelAnchor';

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

describe('drawStarCornerRadiusValueLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw a "Radius N" badge at the handle anchor, in the same blue used for the draft frame stroke', () => {
    // before
    drawStarCornerRadiusValueLabel(context, BOUNDS, 5, 0.4, 15, 0, false, false, true);

    // result
    const { anchor } = getStarCornerRadiusValueLabelAnchor(BOUNDS, 5, 0.4, 15, 0, IDENTITY_VIEWPORT, false, false, true);
    const [, , , , text, calledAnchor, , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('Radius 15');
    expect(calledAnchor.x).toBeCloseTo(anchor.x);
    expect(calledAnchor.y).toBeCloseTo(anchor.y);
    expect(options.fill).toBe('#337ae1');
  });
});
