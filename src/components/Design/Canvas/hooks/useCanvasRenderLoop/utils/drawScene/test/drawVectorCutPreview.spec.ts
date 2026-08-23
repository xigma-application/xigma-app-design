// types
import { TVectorCutPreview } from 'types/design/canvas/types';

// utils
import { drawVectorCutPreview } from '../drawVectorCutPreview';

const drawLineMock = vi.fn();
const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({
  drawLine: (...args: unknown[]): void => drawLineMock(...args),
}));
vi.mock('utils/canvas/shapes/drawEllipse', () => ({
  drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawVectorCutPreview', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    drawEllipseMock.mockClear();
  });

  it('should draw nothing when there is no active preview', () => {
    // before
    drawVectorCutPreview(gl, program, buffer, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
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
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw one marker per crossing, same size as a plain unselected vertex dot — white center, pink border', () => {
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

    // result — VECTOR_VERTEX_SIZE (5), same size an unselected vertex dot uses
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 5, stroke: '#ff2fc2', width: 5, x: 22.5, y: 47.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 5, stroke: '#ff2fc2', width: 5, x: 72.5, y: 47.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
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

    // result — size 2.5, centered on (25,50)
    expect(drawEllipseMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { fill: '#ffffff', height: 2.5, stroke: '#ff2fc2', width: 2.5, x: 23.75, y: 48.75 },
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
      0,
    );
  });
});
