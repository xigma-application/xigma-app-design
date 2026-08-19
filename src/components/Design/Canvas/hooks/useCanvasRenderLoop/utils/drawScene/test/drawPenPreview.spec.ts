// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { drawPenPreview } from '../drawPenPreview';

const drawVectorStrokeMock = vi.fn();
const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));
vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const NO_NODES: Record<string, TSceneNode> = {};

const call = (
  preview: { from: { x: number; y: number }; tangentFromOffset: { x: number; y: number } | null; to: { x: number; y: number } } | null,
  newVertexPreview: { x: number; y: number } | null,
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeId: string | null,
): void => {
  drawPenPreview(
    {} as WebGL2RenderingContext,
    {} as WebGLProgram,
    {} as WebGLBuffer,
    preview,
    newVertexPreview,
    nodes,
    vectorEditingNodeId,
    100,
    100,
    IDENTITY_VIEWPORT,
  );
};

describe('drawPenPreview', () => {
  beforeEach(() => {
    drawVectorStrokeMock.mockClear();
    drawEllipseMock.mockClear();
  });

  it('should draw nothing when there is no preview segment and no new-vertex preview', () => {
    // before
    call(null, null, NO_NODES, null);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });

  it('should draw a vector stroke for the preview segment from the pen origin to the pointer, plus a vertex-styled dot at its endpoint', () => {
    // mock
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 10 } };

    // before
    call(preview, null, NO_NODES, null);

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

  it('should draw a vertex-styled dot at the raw cursor position when no vector network is open yet', () => {
    // before — no preview, no editing node: just a bare cursor position ahead of the very first click,
    // which has no node/vertex to rotate around
    call(null, { x: 5, y: 5 }, NO_NODES, null);

    // result — VECTOR_VERTEX_SIZE (5) / zoom (1), styled like a real vertex dot (white fill, blue
    // border)
    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock.mock.calls[0][3]).toEqual({ fill: '#ffffff', height: 5, stroke: '#0d99ff', width: 5, x: 2.5, y: 2.5 });
  });

  it('should rotate the preview stroke — and its endpoint dot — around the edited node rotation, matching where the real vertices render', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): v1 -> (5, -5), v2 -> (5, 5), the
    // same math the vertex dots use (drawVectorEditHandlesLayer), so the in-progress preview lands on
    // top of them instead of drawing at the raw, un-rotated local coordinates
    const rotatedVectorNode: TVectorNode = {
      fillColor: null,
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 90,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    };
    const nodes: Record<string, TSceneNode> = { [rotatedVectorNode.id]: rotatedVectorNode };
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: null, to: { x: 10, y: 0 } };

    // before
    call(preview, null, nodes, rotatedVectorNode.id);

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

  it('should curve the preview through a dragged outgoing tangent, rotating it as a direction vector around the origin, not around the node pivot', () => {
    // mock — v1(0,0)/v2(10,0), 90deg around the bounds-center (5, 0): from -> (5, -5), to -> (5, 5);
    const rotatedVectorNode: TVectorNode = {
      fillColor: null,
      id: 'vector-1',
      name: 'Vector',
      parentId: null,
      rotation: 90,
      segments: {},
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
    };
    const nodes: Record<string, TSceneNode> = { [rotatedVectorNode.id]: rotatedVectorNode };
    const preview = { from: { x: 0, y: 0 }, tangentFromOffset: { x: 5, y: 0 }, to: { x: 10, y: 0 } };

    // before
    call(preview, null, nodes, rotatedVectorNode.id);

    // result — a curved (tangent-shaped) preview subdivides into VECTOR_CURVE_SEGMENTS (24) + 1 points,
    const [{ points }] = drawVectorStrokeMock.mock.calls[0][3];

    expect(points).toHaveLength(25);
    expect(points[0].x).toBeCloseTo(5);
    expect(points[0].y).toBeCloseTo(-5);
    expect(points[points.length - 1].x).toBeCloseTo(5);
    expect(points[points.length - 1].y).toBeCloseTo(5);
  });
});
