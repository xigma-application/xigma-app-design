// types
import { NodeType, ToolName } from 'types/design/enums';
import { TSceneNode, TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { isDispatchToolBlocked } from '../isDispatchToolBlocked';

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
  segments: { s1: seg('s1', 'a', 'b') },
  strokeColor: '#000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

describe('isDispatchToolBlocked', () => {
  it('should not block a tool when not in Vector Edit Mode', () => {
    expect(isDispatchToolBlocked(ToolName.frame, [], {})).toBe(false);
  });

  it('should not block a tool listed in the Vector Edit Mode whitelist', () => {
    expect(isDispatchToolBlocked(ToolName.move, ['node-1'], {})).toBe(false);
  });

  it('should block a tool not listed in the Vector Edit Mode whitelist', () => {
    expect(isDispatchToolBlocked(ToolName.frame, ['node-1'], {})).toBe(true);
  });

  it('should not block Variable Width when exactly one edited node is an eligible, non-branching chain', () => {
    // mock
    const node = buildVectorNode();
    const nodes: Record<string, TSceneNode> = { [node.id]: node };

    // result
    expect(isDispatchToolBlocked(ToolName.variableWidth, [node.id], nodes)).toBe(false);
  });

  it('should block Variable Width when no eligible node is being edited, even though the tool itself is whitelisted', () => {
    expect(isDispatchToolBlocked(ToolName.variableWidth, ['missing-node'], {})).toBe(true);
  });

  it('should block Variable Width when two nodes are being edited simultaneously, even if both are eligible on their own', () => {
    // mock
    const first = buildVectorNode({ id: 'vector-1' });
    const second = buildVectorNode({ id: 'vector-2' });
    const nodes: Record<string, TSceneNode> = { [first.id]: first, [second.id]: second };

    // result
    expect(isDispatchToolBlocked(ToolName.variableWidth, [first.id, second.id], nodes)).toBe(true);
  });

  it('should never block Shape Builder, even with no eligible node at all, since it has no eligibility gate', () => {
    expect(isDispatchToolBlocked(ToolName.shapeBuilder, ['missing-node'], {})).toBe(false);
  });
});
