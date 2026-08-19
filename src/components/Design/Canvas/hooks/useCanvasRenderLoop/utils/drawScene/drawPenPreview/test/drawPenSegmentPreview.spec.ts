// utils
import { drawPenSegmentPreview } from '../drawPenSegmentPreview';

const drawVectorStrokeMock = vi.fn();
const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));
vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const ORIGIN = { x: 0, y: 0 };

const call = (
  preview: { from: { x: number; y: number }; tangentFromOffset: { x: number; y: number } | null; to: { x: number; y: number } },
  pivot: { x: number; y: number },
  rotation: number,
): void => {
  drawPenSegmentPreview(
    {} as WebGL2RenderingContext,
    {} as WebGLProgram,
    {} as WebGLBuffer,
    preview,
    pivot,
    rotation,
    100,
    100,
    IDENTITY_VIEWPORT,
  );
};

describe('drawPenSegmentPreview', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
    drawEllipseMock.mockClear();
  });

  it('should draw a vector stroke for the preview segment from the pen origin to the pointer, plus a vertex-styled dot at its endpoint', () => {
    // mock
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 10 } };

    // before
    call(preview, ORIGIN, 0);

    // result
    expect(drawVectorStrokeMock).toHaveBeenCalledTimes(1);
    expect(drawVectorStrokeMock.mock.calls[0][3]).toEqual([
      {
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        segmentId: 'preview',
      },
    ]);

    // result — the dot previews exactly where the next click will land, same as the very-first-point dot
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock.mock.calls[0][3]).toEqual({ fill: '#ffffff', height: 5, stroke: '#0d99ff', width: 5, x: 7.5, y: 7.5 });
  });

  it('should rotate the preview stroke — and its endpoint dot — around the given pivot, matching where the real vertices render', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): v1 -> (5, -5), v2 -> (5, 5), the
    // same math the vertex dots use (drawVectorEditHandlesLayer), so the in-progress preview lands on
    // top of them instead of drawing at the raw, un-rotated local coordinates
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 0 } };

    // before
    call(preview, { x: 5, y: 0 }, 90);

    // result — the stroke's endpoints must sit at the rotated positions, not the raw local ones
    const [{ points }] = drawVectorStrokeMock.mock.calls[0][3];

    expect(points[0].x).toBeCloseTo(5);
    expect(points[0].y).toBeCloseTo(-5);
    expect(points[points.length - 1].x).toBeCloseTo(5);
    expect(points[points.length - 1].y).toBeCloseTo(5);

    // result — the endpoint dot must sit at the rotated position (5, 5), not the raw local (10, 0)
    const dotArgs = drawEllipseMock.mock.calls[0][3];

    expect(dotArgs.x + dotArgs.width / 2).toBeCloseTo(5);
    expect(dotArgs.y + dotArgs.height / 2).toBeCloseTo(5);
  });

  it('should curve the preview through a dragged outgoing tangent, rotating it as a direction vector around the origin, not around the pivot', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): from -> (5, -5), to -> (5, 5)
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: { x: 5, y: 0 }, to: { x: 10, y: 0 } };

    // before
    call(preview, { x: 5, y: 0 }, 90);

    // result — a curved (tangent-shaped) preview subdivides into VECTOR_CURVE_SEGMENTS (24) + 1 points
    const [{ points }] = drawVectorStrokeMock.mock.calls[0][3];

    expect(points).toHaveLength(25);
    expect(points[0].x).toBeCloseTo(5);
    expect(points[0].y).toBeCloseTo(-5);
    expect(points[points.length - 1].x).toBeCloseTo(5);
    expect(points[points.length - 1].y).toBeCloseTo(5);
  });
});
