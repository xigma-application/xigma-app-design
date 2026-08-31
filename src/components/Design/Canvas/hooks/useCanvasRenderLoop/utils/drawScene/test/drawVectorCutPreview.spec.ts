// types
import { TVectorCutPreview } from 'types/design/canvas/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawVectorCutPreview } from '../drawVectorCutPreview';

const drawLineMock = vi.fn();
const drawVectorCutPointMarkerMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({
  drawLine: (...args: unknown[]): void => drawLineMock(...args),
}));
vi.mock('../drawVectorCutPointMarker', () => ({
  drawVectorCutPointMarker: (...args: unknown[]): void => drawVectorCutPointMarkerMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawVectorCutPreview', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    drawVectorCutPointMarkerMock.mockClear();
  });

  it('should draw nothing when there is no active preview', () => {
    // before
    drawVectorCutPreview({ buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT }, createCanvasRefs(), 200, 150);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawVectorCutPointMarkerMock).not.toHaveBeenCalled();
  });

  it('should draw the cut line from start to end even when there are no crossings yet', () => {
    // mock
    const preview: TVectorCutPreview = { crossings: [], lineEnd: { x: 100, y: 50 }, lineStart: { x: 0, y: 50 } };

    // before
    drawVectorCutPreview(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ vectorCut: { vectorCutPreviewRef: { current: preview } } }),
      200,
      150,
    );

    // result
    expect(drawLineMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { x1: 0, x2: 100, y1: 50, y2: 50 },
      '#ff2fc2',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorCutPointMarkerMock).not.toHaveBeenCalled();
  });

  it('should draw one marker per crossing', () => {
    // mock
    const preview: TVectorCutPreview = {
      crossings: [
        { nodeId: 'node-1', point: { x: 25, y: 50 }, segmentId: 's1', t: 0.5 },
        { nodeId: 'node-1', point: { x: 75, y: 50 }, segmentId: 's2', t: 0.5 },
      ],
      lineEnd: { x: 100, y: 50 },
      lineStart: { x: 0, y: 50 },
    };

    // before
    drawVectorCutPreview(
      { buffer, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({ vectorCut: { vectorCutPreviewRef: { current: preview } } }),
      200,
      150,
    );

    // result
    expect(drawVectorCutPointMarkerMock).toHaveBeenCalledTimes(2);
    expect(drawVectorCutPointMarkerMock).toHaveBeenCalledWith(gl, program, buffer, { x: 25, y: 50 }, 200, 150, IDENTITY_VIEWPORT);
    expect(drawVectorCutPointMarkerMock).toHaveBeenCalledWith(gl, program, buffer, { x: 75, y: 50 }, 200, 150, IDENTITY_VIEWPORT);
  });
});
