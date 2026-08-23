// types
import { TVectorCutPreview } from 'types/design/canvas/types';

// utils
import { drawVectorCutPreview } from '../drawVectorCutPreview';

const drawLineMock = vi.fn();
const drawVertexDotMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({
  drawLine: (...args: unknown[]): void => drawLineMock(...args),
}));
vi.mock('../drawVectorEditHandlesLayer/drawVectorVertexDots/drawVertexDot', () => ({
  drawVertexDot: (...args: unknown[]): void => drawVertexDotMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawVectorCutPreview', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    drawVertexDotMock.mockClear();
  });

  it('should draw nothing when there is no active preview', () => {
    // before
    drawVectorCutPreview(gl, program, buffer, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawVertexDotMock).not.toHaveBeenCalled();
  });

  it('should draw the cut line from start to end even when there are no crossings yet', () => {
    // mock
    const preview: TVectorCutPreview = { crossings: [], lineEnd: { x: 100, y: 50 }, lineStart: { x: 0, y: 50 } };

    // before
    drawVectorCutPreview(gl, program, buffer, preview, 200, 150, IDENTITY_VIEWPORT);

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
    expect(drawVertexDotMock).not.toHaveBeenCalled();
  });

  it('should draw one marker dot per crossing', () => {
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
    drawVectorCutPreview(gl, program, buffer, preview, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVertexDotMock).toHaveBeenCalledTimes(2);
    expect(drawVertexDotMock).toHaveBeenCalledWith(gl, program, buffer, 25, 50, 8, '#ff2fc2', 200, 150, IDENTITY_VIEWPORT);
    expect(drawVertexDotMock).toHaveBeenCalledWith(gl, program, buffer, 75, 50, 8, '#ff2fc2', 200, 150, IDENTITY_VIEWPORT);
  });

  it('should scale the marker size down by the current zoom level', () => {
    // mock
    const preview: TVectorCutPreview = {
      crossings: [{ nodeId: 'node-1', point: { x: 25, y: 50 }, segmentId: 's1', t: 0.5 }],
      lineEnd: { x: 100, y: 50 },
      lineStart: { x: 0, y: 50 },
    };

    // before
    drawVectorCutPreview(gl, program, buffer, preview, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result
    expect(drawVertexDotMock).toHaveBeenCalledWith(gl, program, buffer, 25, 50, 4, '#ff2fc2', 200, 150, { x: 0, y: 0, zoom: 2 });
  });
});
