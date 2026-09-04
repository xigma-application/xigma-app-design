// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../types';
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectionOrderScopes } from '../getSelectionOrderScopes';

const buildRect = (id: string, parentId: string | null = null): TSceneNode =>
  ({ fill: '#ffffff', height: 10, id, name: id, parentId, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }) as TSceneNode;

const buildGroup = (id: string, childIds: string[]): TSceneNode =>
  ({ childIds, height: 10, id, name: id, parentId: null, rotation: 0, type: NodeType.group, width: 10, x: 0, y: 0 }) as TSceneNode;

const buildPage = (overrides: Partial<TDesignPage> = {}): TDesignPage => ({
  backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  comments: {},
  guides: [],
  id: 'page-1',
  name: 'Page 1',
  nodes: {},
  paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('getSelectionOrderScopes', () => {
  it('should return the page’s rootOrder for a top-level selected node', () => {
    // mock
    const page = buildPage({
      nodes: { a: buildRect('a') },
      rootOrder: ['a'],
      selectedIds: ['a'],
    });

    // result
    expect(getSelectionOrderScopes(page)).toEqual([['a']]);
  });

  it('should return the parent group’s own childIds for a nested selected node, not rootOrder', () => {
    // mock
    const group = buildGroup('group-1', ['a', 'b']);
    const page = buildPage({
      nodes: { a: buildRect('a', 'group-1'), b: buildRect('b', 'group-1'), 'group-1': group },
      rootOrder: ['group-1'],
      selectedIds: ['a'],
    });

    // result
    expect(getSelectionOrderScopes(page)).toEqual([['a', 'b']]);
  });

  it('should return one scope per distinct parent when the selection spans several containers', () => {
    // mock — one root-level node and one nested node, selected together
    const group = buildGroup('group-1', ['b']);
    const page = buildPage({
      nodes: { a: buildRect('a'), b: buildRect('b', 'group-1'), 'group-1': group },
      rootOrder: ['a', 'group-1'],
      selectedIds: ['a', 'b'],
    });

    // result
    expect(getSelectionOrderScopes(page)).toEqual([['a', 'group-1'], ['b']]);
  });

  it('should not duplicate rootOrder when multiple selected top-level nodes share it', () => {
    // mock
    const page = buildPage({
      nodes: { a: buildRect('a'), b: buildRect('b') },
      rootOrder: ['a', 'b'],
      selectedIds: ['a', 'b'],
    });

    // result
    expect(getSelectionOrderScopes(page)).toEqual([['a', 'b']]);
  });

  it('should return an empty array when nothing is selected', () => {
    // mock
    const page = buildPage({ nodes: { a: buildRect('a') }, rootOrder: ['a'] });

    // result
    expect(getSelectionOrderScopes(page)).toEqual([]);
  });
});
