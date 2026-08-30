// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { walkVectorChainFrom } from '../walkVectorChainFrom';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (segments: TVectorSegment[]): TVectorNode => ({
  fillColor: '#000',
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
  vertices: {},
});

describe('walkVectorChainFrom', () => {
  it('should walk an open a-b-c chain starting from the given end, marking every segment reversed', () => {
    // mock — same a-b-c chain as getVectorChainOrder's own default (b<-a, b->c) walk, but forced
    // to start from 'c' instead of the alphabetically-first 'a'
    const node = buildNode([seg('s2', 'b', 'c'), seg('s1', 'a', 'b')]);

    // before
    const entries = walkVectorChainFrom(node, 'c');

    // result — walked back-to-front relative to getVectorChainOrder's own 'a'-first pick
    expect(entries).toEqual([
      { reversed: true, segmentId: 's2' },
      { reversed: true, segmentId: 's1' },
    ]);
  });

  it('should walk a segment forward when starting from the end its storage direction already reaches', () => {
    // mock — b->a instead of a->b; walking FROM 'b' (its own stored startId) needs no reversal
    const node = buildNode([seg('s1', 'b', 'a')]);

    // before
    const entries = walkVectorChainFrom(node, 'b');

    // result
    expect(entries).toEqual([{ reversed: false, segmentId: 's1' }]);
  });

  it('should stop and return only the segments reachable before hitting a dead end', () => {
    // mock — two disjoint open chains, a-b and c-d; walking from 'a' can only ever reach s1
    const node = buildNode([seg('s1', 'a', 'b'), seg('s2', 'c', 'd')]);

    // before
    const entries = walkVectorChainFrom(node, 'a');

    // result
    expect(entries).toEqual([{ reversed: false, segmentId: 's1' }]);
  });
});
