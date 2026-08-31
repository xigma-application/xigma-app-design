// types
import { TAlignmentGuide } from '../../../../../utils/getGroupAlignmentGuide';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorEditAlignmentGuide } from '../drawVectorEditAlignmentGuide';

const drawAlignmentGuideMock = vi.fn();

vi.mock('../drawAlignmentGuide', () => ({
  drawAlignmentGuide: (...args: unknown[]): void => drawAlignmentGuideMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawVectorEditAlignmentGuide', () => {
  beforeEach(() => {
    drawAlignmentGuideMock.mockClear();
  });

  it('should forward the vector-edit alignment guide ref value to drawAlignmentGuide', () => {
    // mock
    const guide: TAlignmentGuide = { horizontal: null, vertical: { anchor: { x: 0, y: 0 }, match: { x: 10, y: 0 } } };

    // before
    drawVectorEditAlignmentGuide(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ vectorEdit: { vectorAlignmentGuideRef: { current: guide } } }),
      200,
      150,
    );

    // result
    expect(drawAlignmentGuideMock).toHaveBeenCalledWith(gl, program, buffer, guide, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should forward null when there is no vector-edit alignment guide', () => {
    // before
    drawVectorEditAlignmentGuide(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
      200,
      150,
    );

    // result
    expect(drawAlignmentGuideMock).toHaveBeenCalledWith(gl, program, buffer, null, 200, 150, IDENTITY_VIEWPORT);
  });
});
