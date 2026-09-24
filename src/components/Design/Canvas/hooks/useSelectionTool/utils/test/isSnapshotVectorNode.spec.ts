// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isSnapshotVectorNode } from '../isSnapshotVectorNode';

const nodes = {
  boolean: { id: 'boolean', parentId: null, type: NodeType.boolean },
  inside: { id: 'inside', parentId: 'boolean', type: NodeType.vector },
  loose: { id: 'loose', parentId: null, type: NodeType.vector },
  profiled: { id: 'profiled', parentId: null, type: NodeType.vector, widthProfile: { points: {} } },
  rectangle: { id: 'rectangle', parentId: null, type: NodeType.rectangle },
} as unknown as Record<string, TSceneNode>;

describe('isSnapshotVectorNode', () => {
  it('should accept a loose vector', () => {
    // action / result
    expect(isSnapshotVectorNode(nodes.loose, nodes)).toBe(true);
  });

  it.each([['inside'], ['profiled'], ['rectangle'], ['missing']])('should reject %s', (id) => {
    // action / result
    expect(isSnapshotVectorNode(nodes[id], nodes)).toBe(false);
  });
});
