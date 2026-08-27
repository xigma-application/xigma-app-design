// types
import { NodeType, ToolName } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getEraseAwareNodesById } from '../getEraseAwareNodesById';

const buildNode = (id: string, extra: Partial<TSceneNode> = {}): TSceneNode => ({ id, type: NodeType.vector, ...extra }) as TSceneNode;

describe('getEraseAwareNodesById', () => {
  it('should return nodesById untouched when the active tool is not Erase', () => {
    // mock
    const nodesById = { v1: buildNode('v1') };

    // result
    expect(getEraseAwareNodesById(nodesById, [buildNode('v1', { rotation: 99 } as never)], ['v1'], ToolName.cut)).toBe(nodesById);
  });

  it("should swap an editing node's entry for its erase-preview counterpart from sceneNodes", () => {
    // mock
    const real = buildNode('v1');
    const preview = buildNode('v1', { segments: { s1: {} } as never });
    const nodesById = { v1: real };

    // result
    const result = getEraseAwareNodesById(nodesById, [preview], ['v1'], ToolName.erase);

    expect(result.v1).toBe(preview);
    expect(result).not.toBe(nodesById);
  });

  it('should leave a node untouched when it has no counterpart in sceneNodes', () => {
    // mock — e.g. sceneNodes filtered it out for an unrelated reason
    const real = buildNode('v1');
    const nodesById = { v1: real };

    // result
    const result = getEraseAwareNodesById(nodesById, [], ['v1'], ToolName.erase);

    expect(result.v1).toBe(real);
  });

  it('should leave every non-editing node untouched', () => {
    // mock
    const real1 = buildNode('v1');
    const real2 = buildNode('v2');
    const nodesById = { v1: real1, v2: real2 };

    // result
    const result = getEraseAwareNodesById(nodesById, [buildNode('v1', { segments: {} as never })], ['v1'], ToolName.erase);

    expect(result.v2).toBe(real2);
  });
});
