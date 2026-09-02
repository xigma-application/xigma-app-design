// utils
import { drawVertexCountValueLabel } from '../drawVertexCountValueLabel';

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

describe('drawVertexCountValueLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should draw a "Count N" badge offset outward from the handle, in the same blue used for the draft frame stroke', () => {
    // before — the handle sits at (100, 50), straight right of the center (50, 50)
    drawVertexCountValueLabel(context, BOUNDS, { x: 100, y: 50 }, 0, 8);

    // result
    const [, , , , text, anchor, direction, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('Count 8');
    expect(anchor.x).toBeCloseTo(104);
    expect(anchor.y).toBeCloseTo(50);
    expect(direction.x).toBeCloseTo(1);
    expect(direction.y).toBeCloseTo(0);
    expect(options.fill).toBe('#337ae1');
  });
});
