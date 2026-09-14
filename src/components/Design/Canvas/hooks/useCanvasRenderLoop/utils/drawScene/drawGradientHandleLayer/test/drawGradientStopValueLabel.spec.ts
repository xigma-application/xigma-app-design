// utils
import { drawGradientStopValueLabel } from '../drawGradientStopValueLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const context = {
  buffer: {} as WebGLBuffer,
  canvasHeight: 100,
  canvasWidth: 100,
  gl: {} as WebGL2RenderingContext,
  imageContext: {} as never,
  program: {} as WebGLProgram,
  viewport: IDENTITY_VIEWPORT,
};

describe('drawGradientStopValueLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw a percentage badge above the stop, in the gradient guide blue', () => {
    // before
    drawGradientStopValueLabel(context, { x: 50, y: 50 }, 0.29);

    // result
    const [, , , , text, anchor, direction, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('29%');
    expect(anchor.x).toBeCloseTo(50);
    expect(anchor.y).toBeLessThan(50);
    expect(direction).toEqual({ x: 0, y: -1 });
    expect(options.fill).toBe('#0d99ff');
  });
});
