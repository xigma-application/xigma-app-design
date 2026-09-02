// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../../types';
import { TGroupNode } from 'types/design/types';

// utils
import { insertNodesIntoContainer } from '../insertNodesIntoContainer';

const buildPage = (overrides: Partial<TDesignPage>): TDesignPage => ({
  comments: {},
  guides: [],
  id: 'page-1',
  name: 'Page 1',
  nodes: {},
  paintColor: '#d9d9d9',
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('insertNodesIntoContainer', () => {
  it('should splice ids into the page rootOrder when the container parent is null', () => {
    // mock
    const page = buildPage({ rootOrder: ['a', 'c'] });

    // action
    insertNodesIntoContainer(page, null, ['b'], 1);

    // result
    expect(page.rootOrder).toEqual(['a', 'b', 'c']);
  });

  it("should splice ids into a group's childIds when a container parent id is given", () => {
    // mock
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
    const page = buildPage({ nodes: { 'group-1': group } });

    // action
    insertNodesIntoContainer(page, 'group-1', ['b'], 1);

    // result
    expect(group.childIds).toEqual(['a', 'b']);
  });

  it('should no-op when the given container parent id does not resolve to a group', () => {
    // mock
    const page = buildPage({ nodes: {}, rootOrder: [] });

    // action & result — should not throw
    expect(() => insertNodesIntoContainer(page, 'missing', ['a'], 0)).not.toThrow();
  });
});
