// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../../types';
import { TGroupNode, TRectangleNode } from 'types/design/types';

// utils
import { relocateNodeSubtree } from '../relocateNodeSubtree';

const buildRect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
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

const buildGroup = (overrides: Partial<TGroupNode>): TGroupNode => ({
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

const buildPage = (id: string, overrides: Partial<TDesignPage> = {}): TDesignPage => ({
  comments: {},
  guides: [],
  id,
  name: id,
  nodes: {},
  paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('relocateNodeSubtree', () => {
  it('should move a single node’s data from the source page to the target page', () => {
    // mock
    const a = buildRect({ id: 'a' });
    const source = buildPage('source', { nodes: { a }, rootOrder: ['a'] });
    const target = buildPage('target');

    // action
    relocateNodeSubtree(source, target, 'a');

    // result
    expect(source.nodes.a).toBeUndefined();
    expect(source.rootOrder).toEqual([]);
    expect(target.nodes.a).toEqual(a);
    expect(target.rootOrder).toEqual(['a']);
  });

  it('should clear the moved root node’s own parentId, since its old parent never travels with it', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const source = buildPage('source', { nodes: { a }, rootOrder: [] });
    const target = buildPage('target');

    // action
    relocateNodeSubtree(source, target, 'a');

    // result
    expect(target.nodes.a.parentId).toBeNull();
  });

  it('should move a whole group subtree together, leaving the children’s own parentId untouched', () => {
    // mock
    const group = buildGroup({ childIds: ['a', 'b'], id: 'group-1' });
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const b = buildRect({ id: 'b', parentId: 'group-1' });
    const source = buildPage('source', { nodes: { a, b, 'group-1': group }, rootOrder: ['group-1'] });
    const target = buildPage('target');

    // action
    relocateNodeSubtree(source, target, 'group-1');

    // result
    expect(source.nodes).toEqual({});
    expect(target.rootOrder).toEqual(['group-1']);
    expect(target.nodes['group-1'].parentId).toBeNull();
    expect(target.nodes.a.parentId).toBe('group-1');
    expect(target.nodes.b.parentId).toBe('group-1');
  });
});
