// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawDistanceGuides } from '../drawDistanceGuides';

const drawDistanceGuideLineMock = vi.fn();
const drawDistanceGuideOutlinesMock = vi.fn();
const drawValueLabelMock = vi.fn();

vi.mock('../drawDistanceGuideLine', () => ({ drawDistanceGuideLine: (...args: unknown[]): void => drawDistanceGuideLineMock(...args) }));
vi.mock('../drawDistanceGuideOutlines', () => ({
  drawDistanceGuideOutlines: (...args: unknown[]): void => drawDistanceGuideOutlinesMock(...args),
}));
vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const imageContext = {} as never;

describe('drawDistanceGuides', () => {
  beforeEach(() => {
    drawDistanceGuideLineMock.mockClear();
    drawDistanceGuideOutlinesMock.mockClear();
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing when there are no guides', () => {
    // before
    drawDistanceGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawDistanceGuideLineMock).not.toHaveBeenCalled();
    expect(drawDistanceGuideOutlinesMock).not.toHaveBeenCalled();
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should draw every line and label of the current guides, plus the outline overlay', () => {
    // before
    const guides = {
      labels: [{ anchor: { x: 50, y: 50 }, offsetDirection: { x: 0, y: 1 }, text: '50' }],
      lines: [{ dashed: false, x1: 0, x2: 100, y1: 50, y2: 50 }],
    };

    drawDistanceGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { distanceGuidesRef: { current: guides } } }),
    );

    // result
    expect(drawDistanceGuideOutlinesMock).toHaveBeenCalledWith(gl, program, buffer, guides, 200, 150, IDENTITY_VIEWPORT);
    expect(drawDistanceGuideLineMock).toHaveBeenCalledTimes(1);
    expect(drawDistanceGuideLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { dashed: false, x1: 0, x2: 100, y1: 50, y2: 50 },
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
      '50',
      { x: 50, y: 50 },
      { x: 0, y: 1 },
      200,
      150,
      IDENTITY_VIEWPORT,
      { edgeGapPx: 5, fill: '#cd4422' },
    );
  });
});
