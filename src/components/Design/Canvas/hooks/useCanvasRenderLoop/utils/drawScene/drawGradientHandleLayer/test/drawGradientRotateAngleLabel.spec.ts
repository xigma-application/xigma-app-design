// utils
import { drawGradientRotateAngleLabel } from '../drawGradientRotateAngleLabel';

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

describe('drawGradientRotateAngleLabel', () => {
  beforeEach(() => {
    drawValueLabelMock.mockClear();
  });

  it('should anchor right at the pointer position, only nudging the badge edge a few px via edgeGapPx', () => {
    // before — the line runs (0,50) -> (100,50), a flat 0deg angle
    drawGradientRotateAngleLabel(context, { x: 20, y: 30 }, { x: 0, y: 50 }, { x: 100, y: 50 });

    // result
    const [, , , , text, anchor, direction, , , , options] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('0°');
    expect(anchor).toEqual({ x: 20, y: 30 });
    expect(direction).toEqual({ x: 1, y: 0 });
    expect(options.edgeGapPx).toBe(15);
    expect(options.fill).toBe('#0d99ff');
  });

  it('should round and format a non-flat angle', () => {
    // before — the line runs (50,0) -> (50,100), straight down, 90deg
    drawGradientRotateAngleLabel(context, { x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 100 });

    // result
    const [, , , , text] = drawValueLabelMock.mock.calls[0];

    expect(text).toBe('90°');
  });

  it('should keep anchoring exactly at the pointer regardless of zoom — the zoom scaling happens downstream', () => {
    // before
    drawGradientRotateAngleLabel(
      { ...context, viewport: { x: 0, y: 0, zoom: 4 } },
      { x: 20, y: 30 },
      { x: 0, y: 50 },
      { x: 100, y: 50 },
    );

    // result
    const [, , , , , anchor, , , , , options] = drawValueLabelMock.mock.calls[0];

    expect(anchor).toEqual({ x: 20, y: 30 });
    expect(options.edgeGapPx).toBe(15);
  });
});
