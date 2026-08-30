import { Mock } from 'vitest';

// types
import { TTreeItem, TTreeRow } from '../../types';

// utils
import { handleToggleExpand } from '../handleToggleExpand';

type TItem = TTreeItem & { children?: TItem[] };

type TSetup = {
  call: (options?: { recursive?: boolean }) => void;
  setSubtreeExpanded: Mock;
  toggleExpanded: Mock;
};

const buildItem = (id: string, children?: TItem[]): TItem => ({ children, id });
const getChildren = (item: TItem): TItem[] | undefined => item.children;
const buildRow = (item: TItem): TTreeRow<TItem> => ({ depth: 0, hasChildren: true, isExpanded: false, item, parentItem: null });

const setup = (item: TItem, expandedIds: Set<string> = new Set()): TSetup => {
  const setSubtreeExpanded = vi.fn();
  const toggleExpanded = vi.fn();

  return {
    call: (options?: { recursive?: boolean }): void =>
      handleToggleExpand({ expandedIds, getChildren, options, row: buildRow(item), setSubtreeExpanded, toggleExpanded }),
    setSubtreeExpanded,
    toggleExpanded,
  };
};

describe('handleToggleExpand', () => {
  it('should toggle only the clicked row on a non-recursive call', () => {
    // mock
    const { call, setSubtreeExpanded, toggleExpanded } = setup(buildItem('2', [buildItem('3')]));

    // action
    call();

    // result
    expect(toggleExpanded).toHaveBeenCalledWith('2');
    expect(setSubtreeExpanded).not.toHaveBeenCalled();
  });

  it('should expand the whole subtree when the clicked row is currently collapsed', () => {
    // mock
    const { call, setSubtreeExpanded, toggleExpanded } = setup(buildItem('2', [buildItem('3', [buildItem('4')])]));

    // action
    call({ recursive: true });

    // result
    expect(setSubtreeExpanded).toHaveBeenCalledWith(['2', '3'], true);
    expect(toggleExpanded).not.toHaveBeenCalled();
  });

  it('should collapse the whole subtree when the clicked row is currently expanded', () => {
    // mock
    const { call, setSubtreeExpanded } = setup(buildItem('2', [buildItem('3', [buildItem('4')])]), new Set(['2']));

    // action
    call({ recursive: true });

    // result
    expect(setSubtreeExpanded).toHaveBeenCalledWith(['2', '3'], false);
  });
});
