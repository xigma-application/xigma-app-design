// others
import {
  ASPECT_RATIO_LOCK_GUIDE_DASH_GAP_PX,
  ASPECT_RATIO_LOCK_GUIDE_DASH_LENGTH_PX,
  ASPECT_RATIO_LOCK_GUIDE_STROKE,
} from 'constant/canvas';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawAspectRatioLockGuide } from '../drawAspectRatioLockGuide';

const drawDashedLineMock = vi.fn();

vi.mock('utils/canvas/drawDashedLine', () => ({
  drawDashedLine: (...args: unknown[]): void => drawDashedLineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 2 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawAspectRatioLockGuide', () => {
  beforeEach(() => {
    drawDashedLineMock.mockClear();
  });

  it('should draw nothing when there is no guide set', () => {
    // before
    drawAspectRatioLockGuide(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawDashedLineMock).not.toHaveBeenCalled();
  });

  it('should draw a dashed diagonal from the top-left to the bottom-right corner for an unrotated guide', () => {
    // before
    drawAspectRatioLockGuide(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { aspectRatioLockGuideRef: { current: { height: 100, rotation: 0, width: 100, x: 0, y: 0 } } } }),
    );

    // result
    expect(drawDashedLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 0, x2: 100, y1: 0, y2: 100 },
      ASPECT_RATIO_LOCK_GUIDE_STROKE,
      1 / IDENTITY_VIEWPORT.zoom,
      200,
      150,
      IDENTITY_VIEWPORT,
      ASPECT_RATIO_LOCK_GUIDE_DASH_LENGTH_PX,
      ASPECT_RATIO_LOCK_GUIDE_DASH_GAP_PX,
    );
  });

  it('should rotate the diagonal endpoints around the guide center for a rotated guide', () => {
    // before — a 100x100 box centered at (50,50), rotated 90°: the TL/BR diagonal corners swap onto the other diagonal
    drawAspectRatioLockGuide(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { aspectRatioLockGuideRef: { current: { height: 100, rotation: 90, width: 100, x: 0, y: 0 } } } }),
    );

    // result
    const [, , , line] = drawDashedLineMock.mock.calls[0];

    expect(line.x1).toBeCloseTo(100);
    expect(line.y1).toBeCloseTo(0);
    expect(line.x2).toBeCloseTo(0);
    expect(line.y2).toBeCloseTo(100);
  });
});
