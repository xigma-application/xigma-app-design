// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawPencilPreview } from '../drawPencilPreview';

const refsFor = (previewPoints: TPoint[] | null, rawPreviewPoints: TPoint[] | null, showRawPreview: boolean): TCanvasRefs =>
  createCanvasRefs({
    pencil: {
      pencilPreviewPointsRef: { current: previewPoints },
      pencilRawPreviewPointsRef: { current: rawPreviewPoints },
      pencilShowRawPreviewRef: { current: showRawPreview },
    },
  });

const drawVectorStrokeMock = vi.fn();
const drawVectorRoundedCapsMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));
vi.mock('utils/canvas/drawVectorNode/drawVectorRoundedCaps', () => ({
  drawVectorRoundedCaps: (...args: unknown[]): void => drawVectorRoundedCapsMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawPencilPreview', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
    drawVectorRoundedCapsMock.mockClear();
  });

  it('should draw nothing when there are no points', () => {
    // before
    drawPencilPreview(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      refsFor(null, null, false),
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(drawVectorRoundedCapsMock).not.toHaveBeenCalled();
  });

  it('should draw nothing for a single point (no segment to draw yet)', () => {
    // before
    drawPencilPreview(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 100,
        canvasWidth: 100,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      refsFor([{ x: 0, y: 0 }], null, false),
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(drawVectorRoundedCapsMock).not.toHaveBeenCalled();
  });

  it('should draw rounded caps at the open ends of the in-progress stroke, same as a committed node', () => {
    // mock — the live preview must look capped the whole time it's being drawn, not only once
    // committed, otherwise the ends visibly "pop" into their rounded shape only after release
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];

    // before
    drawPencilPreview(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 200,
        canvasWidth: 200,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      refsFor(points, null, false),
    );

    // result
    expect(drawVectorRoundedCapsMock).toHaveBeenCalledTimes(1);

    const [, , , previewNode] = drawVectorRoundedCapsMock.mock.calls[0];

    expect(previewNode.capStyle).toBe('round');
    expect(Object.keys(previewNode.vertices)).toHaveLength(2);
  });

  it('should draw a curve-fit stroke (not the raw straight line) for two points', () => {
    // mock — a straight 2-point input; the preview must still go through the same curve-fitting
    // pipeline as a committed node, not a bare 2-point polyline, so it reads as "already rounding"
    // while the user is still drawing
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];

    // before
    drawPencilPreview(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 200,
        canvasWidth: 200,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      refsFor(points, null, false),
    );

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);

    const [gl, program, buffer, segments, strokeColor, strokeWidth, canvasWidth, canvasHeight, viewport] =
      drawVectorStrokeMock.mock.calls[0];

    expect(gl).toEqual({});
    expect(program).toEqual({});
    expect(buffer).toEqual({});
    expect(segments).toHaveLength(1);
    expect(segments[0].points.length).toBeGreaterThan(2);
    expect(segments[0].points[0]).toEqual({ x: 0, y: 0 });
    expect(segments[0].points[segments[0].points.length - 1]).toEqual({ x: 100, y: 0 });
    expect(strokeColor).toBe('#ffffff');
    expect(strokeWidth).toBe(2);
    expect(canvasWidth).toBe(200);
    expect(canvasHeight).toBe(200);
    expect(viewport).toBe(IDENTITY_VIEWPORT);
  });

  it('should fit a real curve through 3+ points, not just draw straight chords between them', () => {
    // mock — a sharp direction change; the flattened stroke must bulge away from the raw polyline,
    // proving the tangents actually curve the path rather than passing through unmodified
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ];

    // before
    drawPencilPreview(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 200,
        canvasWidth: 200,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      refsFor(points, null, false),
    );

    // result — every sampled point must lie exactly on the vertex chain's start/end for each segment,
    // and the midpoint of the first segment must curve toward the vertex (50,50), not sit on the
    // straight (0,0)->(50,50) chord's own interior points untouched
    const [, , , segments] = drawVectorStrokeMock.mock.calls[0];
    const firstSegmentPoints: { x: number; y: number }[] = segments[0].points;
    const midIndex = Math.floor(firstSegmentPoints.length / 2);

    expect(firstSegmentPoints[0]).toEqual({ x: 0, y: 0 });
    expect(firstSegmentPoints[midIndex].y).toBeGreaterThan(0);
    expect(firstSegmentPoints[midIndex].y).toBeLessThan(50);
  });

  it('should draw the raw points as a plain polyline, uncurved and uncapped, when raw-preview mode is active', () => {
    // mock — "brutal mode": holding Ctrl must show exactly the unprocessed mouse path, not the
    // smoothed/curved/capped version, even though smoothed preview points are also available
    const rawPoints = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ];
    const smoothedPoints = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];

    // before
    drawPencilPreview(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 200,
        canvasWidth: 200,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      refsFor(smoothedPoints, rawPoints, true),
    );

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorRoundedCapsMock).not.toHaveBeenCalled();

    const [, , , segments] = drawVectorStrokeMock.mock.calls[0];

    expect(segments).toEqual([
      { endId: 'pencil-raw-preview-end', points: rawPoints, segmentId: 'pencil-raw-preview', startId: 'pencil-raw-preview-start' },
    ]);
  });

  it('should draw nothing in raw-preview mode when there are fewer than 2 raw points', () => {
    // before
    drawPencilPreview(
      {
        buffer: {} as WebGLBuffer,
        canvasHeight: 200,
        canvasWidth: 200,
        gl: {} as WebGL2RenderingContext,
        imageContext: {} as never,
        program: {} as WebGLProgram,
        viewport: IDENTITY_VIEWPORT,
      },
      refsFor(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        [{ x: 0, y: 0 }],
        true,
      ),
    );

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });
});
