// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { getUngroupableGroups } from '../getUngroupableGroups';

const group: TGroupNode = {
  childIds: ['a'],
  height: 10,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
};

const rect: TRectangleNode = {
  fill: '#fff',
  height: 10,
  id: 'a',
  name: 'Rectangle',
  parentId: 'group-1',
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
};

describe('getUngroupableGroups', () => {
  const nodes: Record<string, TSceneNode> = { 'group-1': group, a: rect };

  it('should keep only the ids that resolve to a group node', () => {
    // action & result
    expect(getUngroupableGroups(['group-1', 'a', 'missing'], nodes)).toEqual([group]);
  });

  it('should return an empty list when no id is a group', () => {
    // action & result
    expect(getUngroupableGroups(['a'], nodes)).toEqual([]);
  });
});
