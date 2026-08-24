// types
import { NodeType, ToolName } from 'types/design/enums';
import { TSceneNode, TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { isVectorEditMoreToolDisabled } from '../isVectorEditMoreToolDisabled';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({
  endId,
  id,
  startId,
  tangentEnd: null,
  tangentStart: null,
});

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  fillColor: '#000',
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

describe('isVectorEditMoreToolDisabled', () => {
  it('should never disable Shape Builder, even with no eligible nodes being edited', () => {
    expect(isVectorEditMoreToolDisabled(ToolName.shapeBuilder, [], {})).toBe(false);
  });

  it('should disable Variable Width when no node is being edited at all', () => {
    expect(isVectorEditMoreToolDisabled(ToolName.variableWidth, [], {})).toBe(true);
  });

  it('should disable Variable Width when the edited node is a branching network', () => {
    // mock
    const node = buildVectorNode({
      segments: { s1: seg('s1', 'a', 'b'), s2: seg('s2', 'b', 'c'), s3: seg('s3', 'b', 'd') },
    });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // result
    expect(isVectorEditMoreToolDisabled(ToolName.variableWidth, [node.id], nodes)).toBe(true);
  });

  it('should enable Variable Width when exactly one edited node is a non-branching chain', () => {
    // mock
    const node = buildVectorNode({ segments: { s1: seg('s1', 'a', 'b') } });
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // result
    expect(isVectorEditMoreToolDisabled(ToolName.variableWidth, [node.id], nodes)).toBe(false);
  });

  it('should disable Variable Width when two nodes are being edited simultaneously, even if both are eligible on their own', () => {
    // mock
    const first = buildVectorNode({ id: 'vector-1', segments: { s1: seg('s1', 'a', 'b') } });
    const second = buildVectorNode({ id: 'vector-2', segments: { s1: seg('s1', 'a', 'b') } });
    const nodes: Record<string, TSceneNode> = { [first.id]: first, [second.id]: second };

    // result
    expect(isVectorEditMoreToolDisabled(ToolName.variableWidth, [first.id, second.id], nodes)).toBe(true);
  });
});
