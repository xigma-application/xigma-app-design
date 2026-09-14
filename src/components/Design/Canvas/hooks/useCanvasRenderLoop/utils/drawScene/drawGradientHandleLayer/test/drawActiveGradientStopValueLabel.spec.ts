// utils
import { drawActiveGradientStopValueLabel } from '../drawActiveGradientStopValueLabel';

const drawGradientStopValueLabelMock = vi.fn();

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
const STOPS = [
  { color: '#ffffff', opacity: 100, position: 0 },
  { color: '#000000', opacity: 100, position: 1 },
];
const POSITIONS = [
  { x: 0, y: -18 },
  { x: 100, y: -18 },
];
const DIRECTIONS = [
  { x: 0, y: -1 },
  { x: 0, y: -1 },
];

describe('drawActiveGradientStopValueLabel', () => {
  beforeEach(() => {
    drawGradientStopValueLabelMock.mockClear();
  });

  it('should draw nothing when there is no active stop', () => {
    // before
    drawActiveGradientStopValueLabel(CONTEXT, STOPS, POSITIONS, DIRECTIONS, null);

    // result
    expect(drawGradientStopValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw the label at the active stop’s own position and direction, with its own value', () => {
    // before
    drawActiveGradientStopValueLabel(CONTEXT, STOPS, POSITIONS, DIRECTIONS, 1);

    // result
    expect(drawGradientStopValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawGradientStopValueLabelMock).toHaveBeenCalledWith(CONTEXT, POSITIONS[1], DIRECTIONS[1], STOPS[1].position);
  });

  it('should draw nothing when the active index is out of range', () => {
    // before
    drawActiveGradientStopValueLabel(CONTEXT, STOPS, POSITIONS, DIRECTIONS, 5);

    // result
    expect(drawGradientStopValueLabelMock).not.toHaveBeenCalled();
  });
});
