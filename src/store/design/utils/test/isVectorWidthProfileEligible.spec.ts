// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { isVectorWidthProfileEligible } from '../isVectorWidthProfileEligible';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
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

describe('isVectorWidthProfileEligible', () => {
  it('should be eligible when the node has no width profile', () => {
    // mock
    const node = buildNode({ segments: { s1: seg('s1', 'a', 'b') }, widthProfile: null });

    // result
    expect(isVectorWidthProfileEligible(node)).toBe(true);
  });

  it('should be eligible when the network is a single non-branching chain', () => {
    // mock
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c') },
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } },
    });

    // result
    expect(isVectorWidthProfileEligible(node)).toBe(true);
  });

  it('should be ineligible once the network branches', () => {
    // mock — b becomes a 3-way branch
    const node = buildNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') },
      widthProfile: { points: { p1: { id: 'p1', leftOffset: 2, position: 0.5, rightOffset: 2 } } },
    });

    // result
    expect(isVectorWidthProfileEligible(node)).toBe(false);
  });
});
