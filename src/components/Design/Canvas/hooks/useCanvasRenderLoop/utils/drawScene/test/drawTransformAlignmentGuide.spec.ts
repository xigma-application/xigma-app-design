// types
import { TAlignmentGuide } from '../../../../../utils/getGroupAlignmentGuide';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawTransformAlignmentGuide } from '../drawTransformAlignmentGuide';

const drawAlignmentGuideMock = vi.fn();

vi.mock('../drawAlignmentGuide', () => ({
  drawAlignmentGuide: (...args: unknown[]): void => drawAlignmentGuideMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawTransformAlignmentGuide', () => {
  beforeEach(() => {
    drawAlignmentGuideMock.mockClear();
  });

  it('should forward the transform alignment guide ref value to drawAlignmentGuide', () => {
    // mock
    const guide: TAlignmentGuide = { horizontal: { anchor: { x: 0, y: 0 }, match: { x: 0, y: 10 } }, vertical: null };

    // before
    drawTransformAlignmentGuide(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ transform: { alignmentGuideRef: { current: guide } } }),
      200,
      150,
    );

    // result
    expect(drawAlignmentGuideMock).toHaveBeenCalledWith(gl, program, buffer, guide, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should forward null when there is no transform alignment guide', () => {
    // before
    drawTransformAlignmentGuide(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
      200,
      150,
    );

    // result
    expect(drawAlignmentGuideMock).toHaveBeenCalledWith(gl, program, buffer, null, 200, 150, IDENTITY_VIEWPORT);
  });
});
