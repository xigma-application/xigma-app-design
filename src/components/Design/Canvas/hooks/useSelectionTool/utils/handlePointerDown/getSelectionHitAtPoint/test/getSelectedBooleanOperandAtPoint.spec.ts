// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectedBooleanOperandAtPoint } from '../getSelectedBooleanOperandAtPoint';

const nodesById = {
  boolean: { childIds: ['inside'], id: 'boolean', parentId: null, type: NodeType.boolean },
  inside: { fills: [], height: 40, id: 'inside', parentId: 'boolean', rotation: 0, type: NodeType.rectangle, width: 40, x: 0, y: 0 },
  loose: { fills: [], height: 40, id: 'loose', parentId: null, rotation: 0, type: NodeType.rectangle, width: 40, x: 0, y: 0 },
} as unknown as Record<string, TSceneNode>;

describe('getSelectedBooleanOperandAtPoint', () => {
  it('should grab a selected boolean child anywhere within its frame', () => {
    // action / result
    expect(getSelectedBooleanOperandAtPoint({ x: 20, y: 20 }, [nodesById.inside], nodesById)).toBe(nodesById.inside);
  });

  it('should ignore a point outside the frame', () => {
    // action / result
    expect(getSelectedBooleanOperandAtPoint({ x: 80, y: 80 }, [nodesById.inside], nodesById)).toBeNull();
  });

  it('should ignore selected nodes outside a boolean', () => {
    // action / result
    expect(getSelectedBooleanOperandAtPoint({ x: 20, y: 20 }, [nodesById.loose], nodesById)).toBeNull();
  });
});
