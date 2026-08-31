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

  it('should return the same left-to-right tangent angle whether the segment is stored a->b or b->a', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const forward = sampleVectorChainAtLength(CENTER, getChainSampleData(node) as TChainSampleData, 0).angleDegrees;

    // mock — the same physical a(0,0)->b(100,0) line, but the segment itself is stored reversed
    // (b->a); the chain still walks it starting from 'a', so the reading direction is identical
    const reversedStorageNode = buildNode({
      segments: { s1: seg('s1', 'b', 'a') },
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    });
    const backward = sampleVectorChainAtLength(CENTER, getChainSampleData(reversedStorageNode) as TChainSampleData, 0).angleDegrees;

    // result — same on-screen line, same reading direction, so the same tangent angle regardless
    // of which way the segment happens to be stored
    expect((((forward - backward) % 360) + 360) % 360).toBeCloseTo(0);
  });

  it('should sample from the first-drawn vertex at length 0, even when it sits on the right', () => {
    // mock — 'alpha' (100,0) was drawn before 'zulu' (0,0); length 0 must land on 'alpha'
    // regardless of it sitting on the right — draw order decides the start, not screen position
    const node = buildNode({
      segments: { s1: seg('s1', 'alpha', 'zulu') },
      vertices: { alpha: { id: 'alpha', x: 100, y: 0 }, zulu: { id: 'zulu', x: 0, y: 0 } },
    });
    const data = getChainSampleData(node) as TChainSampleData;

    // result — length 0 lands on 'alpha' (100,0), centre-relative (50,-50)
    const sample = sampleVectorChainAtLength(CENTER, data, 0);

    expect(sample.x).toBeCloseTo(50);
    expect(sample.y).toBeCloseTo(-50);
  });

  it('should return the zero sample directly for a zero-length (coincident-point) chain instead of dividing by zero', () => {
    // mock — a self-closing segment whose start and end are the same vertex
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'a') }, vertices: { a: { id: 'a', x: 5, y: 5 } } });
    const data = getChainSampleData(node) as TChainSampleData;

    // result
    expect(sampleVectorChainAtLength(CENTER, data, 10)).toEqual({ angleDegrees: 0, x: 0, y: 0 });
  });
});
