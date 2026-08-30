// types
import { NodeType } from 'types/design/enums';
import { TVectorChainArcLengthSample } from '../../../../vectorNetwork/getVectorChainArcLengthTable';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getIsChainReadingReversed } from '../getIsChainReadingReversed';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

// a single straight segment start(startX,startY)->end(endX,endY), as a 2-sample table (matches
// what getVectorChainArcLengthTable produces for a straight, non-curved single segment)
const straightTable = (length: number): TVectorChainArcLengthSample[] => [
  { length: 0, segmentId: 's1', t: 0 },
  { length, segmentId: 's1', t: 1 },
];

describe('getIsChainReadingReversed', () => {
  it('should return false for a closed loop, without even inspecting geometry', () => {
    // mock — start/end swapped as if walking right-to-left, but isClosed short-circuits first
    const node = buildNode({
      segments: { s1: seg('s1', 'b', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });

    // result
    expect(getIsChainReadingReversed(node, true, straightTable(100))).toBe(false);
  });

  it('should return false for a zero-length (coincident-point) chain', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'a') },
      vertices: { a: { id: 'a', x: 5, y: 5 } },
    });

    // result
    expect(getIsChainReadingReversed(node, false, straightTable(0))).toBe(false);
  });

  it('should return false when the chain already walks left-to-right', () => {
    // mock — start(0,0) -> end(100,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });

    // result
    expect(getIsChainReadingReversed(node, false, straightTable(100))).toBe(false);
  });

  it('should return true when the chain walks right-to-left', () => {
    // mock — start(100,0) -> end(0,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 100, y: 0 }, b: { id: 'b', x: 0, y: 0 } },
    });

    // result
    expect(getIsChainReadingReversed(node, false, straightTable(100))).toBe(true);
  });

  it('should return false when a vertical chain already walks top-to-bottom', () => {
    // mock — start(0,0) -> end(0,100)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 0, y: 100 } },
    });

    // result
    expect(getIsChainReadingReversed(node, false, straightTable(100))).toBe(false);
  });

  it('should return true when a vertical chain walks bottom-to-top', () => {
    // mock — start(0,100) -> end(0,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 100 }, b: { id: 'b', x: 0, y: 0 } },
    });

    // result
    expect(getIsChainReadingReversed(node, false, straightTable(100))).toBe(true);
  });

  it('should favor a rightward reading for a diagonal chain, even when it also trends downward', () => {
    // mock — start(0,0) -> end(100,50): rightward AND downward
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 50 } },
    });

    // result
    expect(getIsChainReadingReversed(node, false, straightTable(Math.hypot(100, 50)))).toBe(false);
  });
});
