// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getChainSampleData, TChainSampleData } from '../getChainSampleData';
import { sampleVectorChainAtLength } from '../sampleVectorChainAtLength';

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

const CENTER = { x: 50, y: 50 };

describe('sampleVectorChainAtLength', () => {
  it('should return the chain start relative to the given centre, at length 0', () => {
    // mock — a(0,0)->b(100,0)
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const data = getChainSampleData(node) as TChainSampleData;

    // result — world point a=(0,0) -> centre-relative (-50,-50)
    const sample = sampleVectorChainAtLength(CENTER, data, 0);

    expect(sample.x).toBeCloseTo(-50);
    expect(sample.y).toBeCloseTo(-50);
  });

  it('should clamp beyond the chain end for an open chain instead of wrapping', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const data = getChainSampleData(node) as TChainSampleData;

    // result
    const atEnd = sampleVectorChainAtLength(CENTER, data, 100);
    const beyondEnd = sampleVectorChainAtLength(CENTER, data, 150);

    expect(beyondEnd).toEqual(atEnd);
  });

  it('should wrap modulo totalLength for a closed loop', () => {
    // mock — a(0,0)->b(100,0)->a, a closed 2-segment loop, total length 200
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const data = getChainSampleData(node) as TChainSampleData;

    // result — 250 wraps to 50, the same point as sampling at 50 directly
    const wrapped = sampleVectorChainAtLength(CENTER, data, 250);
    const direct = sampleVectorChainAtLength(CENTER, data, 50);

    expect(wrapped.x).toBeCloseTo(direct.x);
    expect(wrapped.y).toBeCloseTo(direct.y);
  });

  it('should return the tangent-facing angle for a left-to-right segment, opposite for the reversed segment', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const forward = sampleVectorChainAtLength(CENTER, getChainSampleData(node) as TChainSampleData, 0).angleDegrees;

    // mock — the reversed segment, b->a
    const reversedNode = buildNode({
      segments: { s1: seg('s1', 'b', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const backward = sampleVectorChainAtLength(CENTER, getChainSampleData(reversedNode) as TChainSampleData, 0).angleDegrees;

    // result — the two tangent directions point opposite ways
    expect(Math.abs(forward - backward)).toBeCloseTo(180);
  });

  it('should return the zero sample directly for a zero-length (coincident-point) chain instead of dividing by zero', () => {
    // mock — a self-closing segment whose start and end are the same vertex
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });
    const data = getChainSampleData(node) as TChainSampleData;

    // result
    expect(sampleVectorChainAtLength(CENTER, data, 10)).toEqual({ angleDegrees: 0, x: 0, y: 0 });
  });
});
