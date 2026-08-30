// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getNodesById } from '../getNodesById';

const buildNode = (id: string): TSceneNode => ({
  fill: '#ff0000',
  height: 10,
  id,
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

describe('getNodesById', () => {
  it('should key every node by its own id', () => {
    // mock
    const a = buildNode('a');
    const b = buildNode('b');

    // result
    expect(getNodesById([a, b])).toEqual({ a, b });
  });

  it('should return an empty record for an empty node list', () => {
    // result
    expect(getNodesById([])).toEqual({});
  });
});
