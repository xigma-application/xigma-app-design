// types
import { TDesignState } from '../../../types';

// utils
import { handleSelectionPerParent } from '../handleSelectionPerParent';

const makeState = (selectedIds: string[]): TDesignState =>
  ({
    activePageId: 'page',
    pages: {
      page: { nodes: { a: { parentId: null }, b: { parentId: 'frame' }, c: { parentId: null } }, selectedIds },
    },
  }) as unknown as TDesignState;

describe('handleSelectionPerParent', () => {
  it('should run once per parent with its own id and select every result', () => {
    // mock
    const state = makeState(['a', 'b', 'c']);
    const handled: [string, string[]][] = [];

    // action
    handleSelectionPerParent(state, 'group', (draft, groupId) => {
      handled.push([groupId, draft.pages.page.selectedIds]);
      draft.pages.page.selectedIds = [groupId];
    });

    // result
    expect(handled).toEqual([
      ['group', ['a', 'c']],
      ['group-1', ['b']],
    ]);
    expect(state.pages.page.selectedIds).toEqual(['group', 'group-1']);
  });

  it('should run once with the given id for a single parent', () => {
    // mock
    const state = makeState(['a', 'c']);
    const handle = vi.fn();

    // action
    handleSelectionPerParent(state, 'group', handle);

    // result
    expect(handle).toHaveBeenCalledTimes(1);
    expect(handle).toHaveBeenCalledWith(state, 'group');
  });
});
