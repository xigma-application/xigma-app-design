// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode, TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getEligibleVectorWidthNodes } from '../getEligibleVectorWidthNodes';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
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

describe('getEligibleVectorWidthNodes', () => {
  it('should keep a vector node whose network is a single non-branching chain', () => {
    // mock
    const node = buildVectorNode({ segments: { s1: seg('s1', 'a', 'b') } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // result
    expect(getEligibleVectorWidthNodes([node.id], nodes)).toEqual([node]);
  });

  it('should drop a vector node whose network branches', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') },
    });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // result
    expect(getEligibleVectorWidthNodes([node.id], nodes)).toEqual([]);
  });

  it('should drop a non-vector node', () => {
    // mock
    const frameNode: TFrameNode = {
      fill: '#fff',
      height: 10,
      id: 'frame-1',
      name: 'Frame',
      parentId: null,
      rotation: 0,
      childIds: [], clipContent: true, type: NodeType.frame,
      width: 10,
      x: 0,
      y: 0,
    };
    const nodes: Record<string, TSceneNode> = { [frameNode.id]: frameNode };

    // result
    expect(getEligibleVectorWidthNodes([frameNode.id], nodes)).toEqual([]);
  });

  it('should drop an id that does not resolve to any node', () => {
    // result
    expect(getEligibleVectorWidthNodes(['missing'], {})).toEqual([]);
  });
});
