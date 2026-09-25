// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getVectorEditingNode } from '../getVectorEditingNode';

const nodes = { r: { id: 'r', type: NodeType.rectangle }, v: { id: 'v', type: NodeType.vector } } as unknown as Record<string, TSceneNode>;

describe('getVectorEditingNode', () => {
  it('should return the vector with the given id', () => {
    // result
    expect(getVectorEditingNode(nodes, 'v')).toBe(nodes.v);
  });

  it('should return nothing for another layer, a missing id or no id', () => {
    // result
    expect(getVectorEditingNode(nodes, 'r')).toBeNull();
    expect(getVectorEditingNode(nodes, 'missing')).toBeNull();
    expect(getVectorEditingNode(nodes, null)).toBeNull();
  });
});
