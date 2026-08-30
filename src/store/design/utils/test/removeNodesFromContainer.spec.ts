// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../types';
import { TGroupNode } from 'types/design/types';

// utils
import { removeNodesFromContainer } from '../removeNodesFromContainer';

const buildPage = (overrides: Partial<TDesignPage>): TDesignPage => ({
  comments: {},
  id: 'page-1',
  name: 'Page 1',
  nodes: {},
  paintColor: '#d9d9d9',
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

describe('removeNodesFromContainer', () => {
  it('should remove ids from the page rootOrder when the container parent is null', () => {
    // mock
    const page = buildPage({ rootOrder: ['a', 'b', 'c'] });

    // action
    removeNodesFromContainer(page, null, ['b']);

    // result
    expect(page.rootOrder).toEqual(['a', 'c']);
  });

  it("should remove ids from a group's childIds when a container parent id is given", () => {
    // mock
    const group: TGroupNode = {
      childIds: ['a', 'b'],
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
    removeNodesFromContainer(page, 'group-1', ['a']);

    // result
    expect(group.childIds).toEqual(['b']);
  });

  it('should no-op when the given container parent id does not resolve to a group', () => {
    // mock
    const page = buildPage({ nodes: {}, rootOrder: [] });

    // action & result — should not throw
    expect(() => removeNodesFromContainer(page, 'missing', ['a'])).not.toThrow();
  });
});
