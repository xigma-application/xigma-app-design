// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawEqualSpacingGuides } from '../drawEqualSpacingGuides';

const drawLineMock = vi.fn();
const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

describe('drawEqualSpacingGuides', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing when there are no guides', () => {
    // before
    drawEqualSpacingGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw one line per gap and one label per gap', () => {
    // before
    drawEqualSpacingGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({
        transform: {
          equalSpacingGuidesRef: {
            current: {
              labels: [{ anchor: { x: 90, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '20' }],
              lines: [{ dashed: false, x1: 80, x2: 100, y1: 50, y2: 50 }],
            },
          },
        },
      }),
    );

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(1);
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { dashed: false, x1: 80, x2: 100, y1: 50, y2: 50 },
      '#ff2fc2',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawValueLabelMock).toHaveBeenCalledTimes(1);
    expect(drawValueLabelMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      imageContext,
      '20',
      { x: 90, y: 50 },
      { x: 0, y: 1 },
      200,
      150,
      IDENTITY_VIEWPORT,
      { fill: '#ff2fc2' },
    );
  });

  it('should scale the stroke width down with zoom', () => {
    // before
    drawEqualSpacingGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: { x: 0, y: 0, zoom: 2 } },
      createCanvasRefs({
        transform: { equalSpacingGuidesRef: { current: { labels: [], lines: [{ dashed: false, x1: 0, x2: 10, y1: 0, y2: 0 }] } } },
      }),
    );

    // result
    expect(drawLineMock.mock.calls[0][5]).toBe(0.5);
  });
});
