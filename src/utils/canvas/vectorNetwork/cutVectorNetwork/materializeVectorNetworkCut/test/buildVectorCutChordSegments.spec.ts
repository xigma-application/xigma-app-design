// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildVectorCutChordSegments } from '../buildVectorCutChordSegments';

const buildSquareNode = (): TVectorNode => {
  const vertices: Record<string, TVectorVertex> = {
    v1: { id: 'v1', x: 0, y: 0 },
    v2: { id: 'v2', x: 100, y: 0 },
    v3: { id: 'v3', x: 100, y: 100 },
    v4: { id: 'v4', x: 0, y: 100 },
  };
  const seg = (id: string, startId: string, endId: string): [string, TVectorSegment] => [
    id,
    { endId, id, startId, tangentEnd: null, tangentStart: null },
  ];
  const segments = Object.fromEntries([seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v4'), seg('s4', 'v4', 'v1')]);

  return {
    defaultFill: null,
    filledFaceKeys: [],
    id: 'n1',
    name: 'square',
    parentId: null,
    rotation: 0,
    segments,
    strokeColor: '#000000',
    strokeWidth: 1,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };
};

describe('buildVectorCutChordSegments', () => {
  it('should return no chords and no chorded vertices for a single side (no adjacent pair)', () => {
    // mock
    const sides = [{ afterId: 'after1', beforeId: 'before1', point: { x: 50, y: 50 }, sideAId: 'a1', sideBId: 'b1' }];

    // before
    const result = buildVectorCutChordSegments(sides, buildSquareNode());

    // result
    expect(result.chordSegments).toEqual({});
    expect(result.chordedVertexIds.size).toBe(0);
  });

  it('should splice two independent chords (one per side) when the stretch between two adjacent crossings runs through the interior of a face', () => {
    // mock — two crossings whose midpoint (50,50) sits inside the square
    const sides = [
      { afterId: 'after1', beforeId: 'before1', point: { x: 50, y: 10 }, sideAId: 'a1', sideBId: 'b1' },
      { afterId: 'after2', beforeId: 'before2', point: { x: 50, y: 90 }, sideAId: 'a2', sideBId: 'b2' },
    ];

    // before
    const result = buildVectorCutChordSegments(sides, buildSquareNode());

    // result — exactly 2 new segments (sideA-to-sideA, sideB-to-sideB), never crossing between sides
    const chords = Object.values(result.chordSegments);

    expect(chords).toHaveLength(2);
    expect(chords.some((chord) => chord.startId === 'a1' && chord.endId === 'a2')).toBe(true);
    expect(chords.some((chord) => chord.startId === 'b1' && chord.endId === 'b2')).toBe(true);
    expect(result.chordedVertexIds).toEqual(new Set(['a1', 'b1', 'a2', 'b2']));
  });

  it('should splice no chord when the stretch between two adjacent crossings runs outside every face', () => {
    // mock — both crossing points sit far outside the square entirely, so their midpoint isn't inside
    // any face either
    const sides = [
      { afterId: 'after1', beforeId: 'before1', point: { x: 500, y: 10 }, sideAId: 'a1', sideBId: 'b1' },
      { afterId: 'after2', beforeId: 'before2', point: { x: 500, y: 90 }, sideAId: 'a2', sideBId: 'b2' },
    ];

    // before
    const result = buildVectorCutChordSegments(sides, buildSquareNode());

    // result
    expect(result.chordSegments).toEqual({});
    expect(result.chordedVertexIds.size).toBe(0);
  });

  it('should only chord the adjacent pair whose own midpoint is interior, leaving an exterior pair untouched, across three crossings', () => {
    // mock — crossings 1&2 both sit on the square's own top edge (their midpoint at y=10 is interior);
    // crossing 3 is far away, so the 2-3 stretch's midpoint is exterior
    const sides = [
      { afterId: 'after1', beforeId: 'before1', point: { x: 30, y: 10 }, sideAId: 'a1', sideBId: 'b1' },
      { afterId: 'after2', beforeId: 'before2', point: { x: 70, y: 10 }, sideAId: 'a2', sideBId: 'b2' },
      { afterId: 'after3', beforeId: 'before3', point: { x: 500, y: 10 }, sideAId: 'a3', sideBId: 'b3' },
    ];

    // before
    const result = buildVectorCutChordSegments(sides, buildSquareNode());

    // result — only the 1-2 pair got chorded; crossing 3's vertices are never chorded
    const chords = Object.values(result.chordSegments);

    expect(chords).toHaveLength(2);
    expect(result.chordedVertexIds).toEqual(new Set(['a1', 'b1', 'a2', 'b2']));
    expect(result.chordedVertexIds.has('a3')).toBe(false);
  });
});
