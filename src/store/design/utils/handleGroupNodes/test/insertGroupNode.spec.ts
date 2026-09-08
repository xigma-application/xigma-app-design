// types
import { NodeType } from 'types/design/enums';
import { TGroupNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { insertGroupNode } from '../insertGroupNode';

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

const buildGroup = (overrides: Partial<TGroupNode> = {}): TGroupNode => ({
  childIds: [],
  height: 10,
  id: 'group-1',
  name: 'Group',
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('insertGroupNode', () => {
  it('should add the group node to the nodes map', () => {
    // mock
    const nodes: Record<string, TSceneNode> = {};
    const group = buildGroup();

    // action
    insertGroupNode(nodes, 'group-1', group, []);

    // result
    expect(nodes['group-1']).toBe(group);
  });

  it('should reparent every ordered member id onto the group', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: null });
    const b = buildRect({ id: 'b', parentId: 'outer' });
    const nodes: Record<string, TSceneNode> = { a, b };
    const group = buildGroup({ childIds: ['a', 'b'] });

    // action
    insertGroupNode(nodes, 'group-1', group, ['a', 'b']);

    // result
    expect(nodes.a.parentId).toBe('group-1');
    expect(nodes.b.parentId).toBe('group-1');
  });
});
