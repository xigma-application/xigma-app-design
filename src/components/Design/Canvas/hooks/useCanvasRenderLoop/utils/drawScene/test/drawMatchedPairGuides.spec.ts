// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawMatchedPairGuides } from '../drawMatchedPairGuides';

const drawLineMock = vi.fn();
const drawXMarkerMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/drawXMarker', () => ({ drawXMarker: (...args: unknown[]): void => drawXMarkerMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawMatchedPairGuides', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    drawXMarkerMock.mockClear();
  });

  it('should draw nothing when there are no guides', () => {
    // before
    drawMatchedPairGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawXMarkerMock).not.toHaveBeenCalled();
  });

  it('should draw one line per guide line and one × per marker', () => {
    // before
    const guides = {
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
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawXMarkerMock).toHaveBeenCalledTimes(3);
  });
});
