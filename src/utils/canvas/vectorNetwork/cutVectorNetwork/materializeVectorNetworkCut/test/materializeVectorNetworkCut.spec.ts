// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../../deriveVectorFaces';
import { getVectorFillLoopKey } from '../../../getVectorFillLoopKey';
import { getVectorFillLoopPoints } from '../../../getVectorFillLoopPoints/getVectorFillLoopPoints';
import { materializeVectorNetworkCut } from '../materializeVectorNetworkCut';

// mock — a rectangle (v1..v4) with an internal chord (sMid) already splitting it into a top and a
// bottom face, both painted; shared by every test below
const buildNode = (): TVectorNode => {
  const vertices: Record<string, TVectorVertex> = {
    v1: { id: 'v1', x: 900, y: 300 },
    v2: { id: 'v2', x: 1000, y: 300 },
    v3: { id: 'v3', x: 1000, y: 400 },
    v4: { id: 'v4', x: 900, y: 400 },
    vMidL: { id: 'vMidL', x: 900, y: 350 },
    vMidR: { id: 'vMidR', x: 1000, y: 350 },
  };
  const seg = (id: string, startId: string, endId: string): [string, TVectorSegment] => [
    id,
    { endId, id, startId, tangentEnd: null, tangentStart: null },
  ];
  const segments = Object.fromEntries([
    seg('s1', 'v1', 'v2'),
    seg('s2', 'v2', 'vMidR'),
    seg('s3', 'vMidR', 'v3'),
    seg('s4', 'v3', 'v4'),
    seg('s5', 'v4', 'vMidL'),
    seg('s6', 'vMidL', 'v1'),
    seg('sMid', 'vMidL', 'vMidR'),
  ]);
  const bareNode = { id: 'n1', name: 'rect', rotation: 0, segments, vertexHandleModes: {}, vertices } as TVectorNode;
  const filledFaceKeys = deriveVectorFaces(bareNode).map((face) => getVectorFillLoopKey(face.pieceKeys));

  return { ...bareNode, filledFaceKeys };
};

describe('materializeVectorNetworkCut', () => {
  it('should return null when the line crosses nothing', () => {
    // before
    const result = materializeVectorNetworkCut(buildNode(), { x: 1500, y: 250 }, { x: 1500, y: 380 });

    // result
    expect(result).toBeNull();
  });

  it('should genuinely sever the segment it crosses when the line only enters the shape once and never crosses back out — two disconnected points, same as a plain Split click, so the touched face loses its fill while the untouched one keeps it', () => {
    // mock — a single crossing on the top edge (s1, bounding only the top face), the drag ends inside
    // the shape rather than exiting again
    const node = buildNode();
    const [, bottomKey] = node.filledFaceKeys!;

    // before
    const result = materializeVectorNetworkCut(node, { x: 950, y: 250 }, { x: 950, y: 320 });

    // result
    expect(result).not.toBeNull();

    const newVertexIds = Object.keys(result!.vertices).filter((id) => !(id in node.vertices));
    const touchingSegments = Object.values(result!.segments).filter(
      (segment) => newVertexIds.includes(segment.startId) || newVertexIds.includes(segment.endId),
    );

    expect(newVertexIds).toHaveLength(2); // two distinct points, not one shared pass-through point
    expect(touchingSegments).toHaveLength(2); // one segment ending at each — nothing bridges them
    expect(touchingSegments[0].id).not.toBe(touchingSegments[1].id);
    expect('s1' in result!.segments).toBe(false); // the original id is gone, not reused by either side

    // the top face (the only one s1 bounds) has no closed loop left at all — no fill for it; the
    // untouched bottom face keeps its exact original fill key, unchanged
    expect(result!.filledFaceKeys).toEqual([bottomKey]);
  });

  it('should keep both new pieces filled when a chord cleanly divides one face in two, Figma-style — even though the crossed segments are still genuinely severed, not shared', () => {
    // mock — crosses the top edge, then the internal chord, cleanly splitting the top face into a left
    // and a right piece; the drag ends inside the bottom face without exiting it again
    const node = buildNode();
    const [, bottomKey] = node.filledFaceKeys!;

    // before
    const result = materializeVectorNetworkCut(node, { x: 950, y: 250 }, { x: 950, y: 380 });

    // result
    expect(result).not.toBeNull();
    expect('s1' in result!.segments).toBe(false);
    expect('sMid' in result!.segments).toBe(false); // sMid is severed too, not left untouched for bottom's sake

    // two brand new fill entries — one per new top piece — since the cut cleanly closed each of them;
    // the bottom face isn't among them at all, since sMid no longer completes its own loop
    expect(result!.filledFaceKeys).toHaveLength(2);
    expect(result!.filledFaceKeys).not.toContain(bottomKey);

    const resultNode = { ...node, segments: result!.segments, vertices: result!.vertices };

    result!.filledFaceKeys.forEach((key) => {
      expect(getVectorFillLoopPoints(resultNode, key)).not.toBeNull();
    });
  });

  it('should not carry the line’s own synthetic start/end vertices into the result', () => {
    // before
    const result = materializeVectorNetworkCut(buildNode(), { x: 950, y: 250 }, { x: 950, y: 380 });

    // result
    Object.values(result!.vertices).forEach((vertex) => {
      expect(vertex.x === 950 && vertex.y === 250).toBe(false);
      expect(vertex.x === 950 && vertex.y === 380).toBe(false);
    });
  });

  it('should drop a line fragment that passes outside the shape between two separate crossed faces, not just the fragments touching its own endpoints', () => {
    // mock — two separate squares far apart on the same node (two disjoint contours), one drag line
    // crossing straight through both; the middle third of the line, between the two squares, must not
    // become a stray chord floating in empty space
    const vertices: Record<string, TVectorVertex> = {
      a1: { id: 'a1', x: 900, y: 300 },
      a2: { id: 'a2', x: 1000, y: 300 },
      a3: { id: 'a3', x: 1000, y: 400 },
      a4: { id: 'a4', x: 900, y: 400 },
      b1: { id: 'b1', x: 1900, y: 300 },
      b2: { id: 'b2', x: 2000, y: 300 },
      b3: { id: 'b3', x: 2000, y: 400 },
      b4: { id: 'b4', x: 1900, y: 400 },
    };
    const seg = (id: string, startId: string, endId: string): [string, TVectorSegment] => [
      id,
      { endId, id, startId, tangentEnd: null, tangentStart: null },
    ];
    const segments = Object.fromEntries([
      seg('sa1', 'a1', 'a2'),
      seg('sa2', 'a2', 'a3'),
      seg('sa3', 'a3', 'a4'),
      seg('sa4', 'a4', 'a1'),
      seg('sb1', 'b1', 'b2'),
      seg('sb2', 'b2', 'b3'),
      seg('sb3', 'b3', 'b4'),
      seg('sb4', 'b4', 'b1'),
    ]);
    const node = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'n1',
      name: 'two-squares',
      parentId: null,
      rotation: 0,
      segments,
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices,
    } as TVectorNode;

    // before — a horizontal line through both squares' vertical middle (y=350), well past both on each side
    const result = materializeVectorNetworkCut(node, { x: 800, y: 350 }, { x: 2100, y: 350 });

    // result — exactly 2 new chords (one per square), nothing spanning the empty gap between them
    const originalSegmentIds = Object.keys(segments);
    const newSegments = Object.values(result!.segments).filter(
      (segment) => !originalSegmentIds.some((id) => segment.id === id || segment.id.startsWith(`${id}#`)),
    );
    const spansGap = (segment: TVectorSegment): boolean => {
      const start = result!.vertices[segment.startId];
      const end = result!.vertices[segment.endId];

      return Math.max(start.x, end.x) - Math.min(start.x, end.x) > 200;
    };

    expect(newSegments.some(spansGap)).toBe(false);
    expect(result!.filledFaceKeys).toEqual([]); // neither square was ever filled to begin with
  });
});
