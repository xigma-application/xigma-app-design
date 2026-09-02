// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getVectorChainOrder } from '../getVectorChainOrder';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (segments: TVectorSegment[], vertexIds: string[] = []): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: Object.fromEntries(vertexIds.map((id) => [id, { id, x: 0, y: 0 }])),
});

describe('getVectorChainOrder', () => {
  it('should order an open chain starting from whichever open end was drawn first, regardless of how the segments themselves are stored', () => {
    // mock — segments stored out of draw order (s2 before s1), but the vertices map says 'a' was
    // placed before 'c' — the walk must follow that draw order, not the segment storage order or
    // the ids' own alphabetical order
    const node = buildNode([seg('s2', 'b', 'c'), seg('s1', 'a', 'b')], ['a', 'b', 'c']);

    // before
    const order = getVectorChainOrder(node);

    // result
    expect(order).toEqual({
      entries: [
        { reversed: false, segmentId: 's1' },
        { reversed: false, segmentId: 's2' },
      ],
      isClosed: false,
    });
  });

  it('should start an open chain from the first-drawn open end even when its id sorts *after* the other end', () => {
    // mock — 'z' was drawn first (the chain's actual "A"), 'a' second, but 'a' < 'z' alphabetically;
    // a naive id sort would start the walk from 'a' and read the chain backwards
    const node = buildNode([seg('s1', 'z', 'a')], ['z', 'a']);

    // result
    expect(getVectorChainOrder(node)).toEqual({ entries: [{ reversed: false, segmentId: 's1' }], isClosed: false });
  });

  it('should order a closed a-b-c-a triangle deterministically and report isClosed', () => {
    // mock
    const node = buildNode([seg('s3', 'c', 'a'), seg('s1', 'a', 'b'), seg('s2', 'b', 'c')], ['a', 'b', 'c']);

    // before
    const order = getVectorChainOrder(node);

    // result
    expect(order).toEqual({
      entries: [
        { reversed: false, segmentId: 's1' },
        { reversed: false, segmentId: 's2' },
        { reversed: false, segmentId: 's3' },
      ],
      isClosed: true,
    });
  });

  it('should walk a segment in reverse when its stored direction opposes the chain-walk direction', () => {
    // mock — b->a instead of a->b
    const node = buildNode([seg('s1', 'b', 'a'), seg('s2', 'b', 'c')], ['a', 'b', 'c']);

    // before
    const order = getVectorChainOrder(node);

    // result — starts at open end 'a', so s1 must be walked start<-end (reversed)
    expect(order).toEqual({
      entries: [
        { reversed: true, segmentId: 's1' },
        { reversed: false, segmentId: 's2' },
      ],
      isClosed: false,
    });
  });

  it('should return null for a branching "Y" network', () => {
    // mock — b is a 3-way branch
    const node = buildNode([seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'b', 'd')]);

    // before
    const order = getVectorChainOrder(node);

    // result
    expect(order).toBeNull();
  });

  it('should return null for two disjoint simple loops in one node', () => {
    // mock — a-b-a and c-d-c, both closed, degree <= 2 everywhere, but not one chain
    const node = buildNode([seg('s1', 'a', 'b'), seg('s2', 'b', 'a'), seg('s3', 'c', 'd'), seg('s4', 'd', 'c')]);

    // before
    const order = getVectorChainOrder(node);

    // result
    expect(order).toBeNull();
  });

  it('should return null for two disjoint open chains (four open ends, no branch point)', () => {
    // mock — a-b and c-d, degree <= 2 everywhere, but four open ends instead of a single chain's two
    const node = buildNode([seg('s1', 'a', 'b'), seg('s2', 'c', 'd')]);

    // before
    const order = getVectorChainOrder(node);

    // result
    expect(order).toBeNull();
  });

  it('should return null for an empty segment set', () => {
    // mock
    const node = buildNode([]);

    // before
    const order = getVectorChainOrder(node);

    // result
    expect(order).toBeNull();
  });

  it('should order a single self-closing segment (a loop of one)', () => {
    // mock — a segment whose start and end are the same vertex
    const node = buildNode([seg('s1', 'a', 'a')]);

    // before
    const order = getVectorChainOrder(node);

    // result
    expect(order).toEqual({ entries: [{ reversed: false, segmentId: 's1' }], isClosed: true });
  });
});
