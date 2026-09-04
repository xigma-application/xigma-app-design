// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { invalidateVectorWidthProfile } from '../invalidateVectorWidthProfile';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [],
  filledFaceKeys: [],
  id: 'vector-1',
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

describe('invalidateVectorWidthProfile', () => {
  it('should discard the width profile when a segments patch makes the network branch', () => {
    // mock
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') },
      widthProfile: { points: {} },
    });

    // action
    invalidateVectorWidthProfile(vectorNode, { segments: vectorNode.segments });

    // result
    expect(vectorNode.widthProfile).toBeNull();
  });

  it('should keep the width profile when a segments patch keeps the network eligible', () => {
    // mock
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b') },
      widthProfile: { points: {} },
    });

    // action
    invalidateVectorWidthProfile(vectorNode, { segments: vectorNode.segments });

    // result
    expect(vectorNode.widthProfile).toEqual({ points: {} });
  });

  it('should not run the eligibility check when the patch does not touch segments', () => {
    // mock
    const vectorNode = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') },
      widthProfile: { points: {} },
    });

    // action
    invalidateVectorWidthProfile(vectorNode, { strokeColor: '#fff' });

    // result — branching network, but untouched since the patch never mentioned segments
    expect(vectorNode.widthProfile).toEqual({ points: {} });
  });

  it('should do nothing for a non-vector node', () => {
    // mock
    const rect = {
      fill: '#fff',
      height: 10,
      id: 'rect-1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle as const,
      width: 10,
      x: 0,
      y: 0,
    };

    // action / result
    expect(() => invalidateVectorWidthProfile(rect, { width: 20 })).not.toThrow();
  });
});
