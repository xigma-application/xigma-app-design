// others
import { DEFAULT_GROUP_NAME } from '../../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { buildGroupNode } from '../buildGroupNode';

const buildRect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#ff0000',
  height: 10,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('buildGroupNode', () => {
  it('should build a group node with the given id, member ids and no rotation', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const b = buildRect({ id: 'b', x: 20, y: 0 });
    const nodes: Record<string, TSceneNode> = { a, b };

    // action
    const group = buildGroupNode('group-1', null, ['a', 'b'], nodes);

    // result
    expect(group.id).toBe('group-1');
    expect(group.type).toBe(NodeType.group);
    expect(group.childIds).toEqual(['a', 'b']);
    expect(group.parentId).toBeNull();
    expect(group.rotation).toBe(0);
    expect(group.name).toBe(DEFAULT_GROUP_NAME);
  });

  it('should size and position the group to the bounding box of its member nodes', () => {
    // mock
    const a = buildRect({ height: 20, id: 'a', width: 20, x: 0, y: 0 });
    const b = buildRect({ height: 10, id: 'b', width: 10, x: 40, y: 30 });
    const nodes: Record<string, TSceneNode> = { a, b };

    // action
    const group = buildGroupNode('group-1', null, ['a', 'b'], nodes);

    // result
    expect(group).toMatchObject({ height: 40, width: 50, x: 0, y: 0 });
  });

  it('should carry the given parentId onto the built group', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'outer' });
    const nodes: Record<string, TSceneNode> = { a };

    // action
    const group = buildGroupNode('group-1', 'outer', ['a'], nodes);

    // result
    expect(group.parentId).toBe('outer');
  });
});
