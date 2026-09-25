// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getBooleanOperandFreeNodes } from '../getBooleanOperandFreeNodes';

const nodesById = {
  bool: { childIds: ['operand'], id: 'bool', parentId: null, type: NodeType.boolean },
  free: { id: 'free', parentId: null, type: NodeType.rectangle },
  operand: { id: 'operand', parentId: 'bool', type: NodeType.rectangle },
} as unknown as Record<string, TSceneNode>;

describe('getBooleanOperandFreeNodes', () => {
  it('should drop the operands of booleans and reuse the result for the same list', () => {
    // mock
    const sceneNodes = [nodesById.bool, nodesById.operand, nodesById.free];

    // before
    const first = getBooleanOperandFreeNodes(sceneNodes, nodesById);

    // result
    expect(first).toEqual([nodesById.bool, nodesById.free]);
    expect(getBooleanOperandFreeNodes(sceneNodes, nodesById)).toBe(first);
  });
});
