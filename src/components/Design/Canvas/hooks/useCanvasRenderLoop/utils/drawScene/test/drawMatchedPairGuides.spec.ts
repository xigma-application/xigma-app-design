// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawMatchedPairGuides } from '../drawMatchedPairGuides';

const drawLineBatchMock = vi.fn();
const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/drawLineBatch', () => ({ drawLineBatch: (...args: unknown[]): void => drawLineBatchMock(...args) }));
vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawMatchedPairGuides', () => {
  beforeEach(() => {
    drawLineBatchMock.mockClear();
    drawValueLabelMock.mockClear();
  });

  it('should draw nothing when there are no guides', () => {
    // before
    drawMatchedPairGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawLineBatchMock).not.toHaveBeenCalled();
    expect(drawValueLabelMock).not.toHaveBeenCalled();
  });

  it('should batch the guide lines with two segments per × marker into one draw and draw one label per gap', () => {
    // before
    const guides = {
      labels: [{ anchor: { x: 25, y: 50 }, offsetDirection: { x: 1, y: 0 }, text: '20' }],
      lines: [
        { dashed: false, x1: 0, x2: 0, y1: 0, y2: 100 },
        { dashed: false, x1: 50, x2: 50, y1: 0, y2: 100 },
      ],
      markers: [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 50, y: 50 },
      ],
    };

    drawMatchedPairGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { matchedPairGuidesRef: { current: guides } } }),
    );

    // result
    expect(drawLineBatchMock).toHaveBeenCalledTimes(1);
    expect(drawLineBatchMock.mock.calls[0][3]).toHaveLength(2 + 3 * 2);
    expect(drawLineBatchMock.mock.calls[0][3][0]).toBe(guides.lines[0]);
    expect(drawValueLabelMock).toHaveBeenCalledTimes(1);
  });
});
