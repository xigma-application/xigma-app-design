// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawEqualSpacingGuides } from '../drawEqualSpacingGuides';

const drawDistanceGuideLineMock = vi.fn();
const drawValueLabelMock = vi.fn();

vi.mock('../drawDistanceGuides/drawDistanceGuideLine', () => ({
  drawDistanceGuideLine: (...args: unknown[]): void => drawDistanceGuideLineMock(...args),
}));
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
    drawDistanceGuideLineMock.mockClear();
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing when there are no guides', () => {
    // before
    drawEqualSpacingGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawDistanceGuideLineMock).not.toHaveBeenCalled();
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw every line and label of the current guides, reusing the distance-guide primitives', () => {
    // before
    const guides = {
      labels: [
        { anchor: { x: 15, y: 10 }, offsetDirection: { x: 0, y: 1 }, text: '10' },
        { anchor: { x: 65, y: 10 }, offsetDirection: { x: 0, y: 1 }, text: '10' },
      ],
      lines: [
        { dashed: false, x1: 0, x2: 30, y1: 10, y2: 10 },
        { dashed: false, x1: 40, x2: 90, y1: 10, y2: 10 },
      ],
    };

    drawEqualSpacingGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { equalSpacingGuidesRef: { current: guides } } }),
    );

    // result
    expect(drawDistanceGuideLineMock).toHaveBeenCalledTimes(2);
    expect(drawValueLabelMock).toHaveBeenCalledTimes(2);
  });
});
