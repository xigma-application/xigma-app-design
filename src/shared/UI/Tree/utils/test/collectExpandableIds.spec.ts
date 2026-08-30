// types
import { TTreeItem } from '../../types';

// utils
import { collectExpandableIds } from '../collectExpandableIds';

type TItem = TTreeItem & { children?: TItem[] };

const buildItem = (id: string, children?: TItem[]): TItem => ({ children, id });
const getChildren = (item: TItem): TItem[] | undefined => item.children;

describe('collectExpandableIds', () => {
  it('should return an empty list for a leaf node', () => {
    expect(collectExpandableIds(buildItem('leaf'), getChildren)).toEqual([]);
  });

  it('should return an empty list for a node whose children array is present but empty', () => {
    expect(collectExpandableIds(buildItem('empty', []), getChildren)).toEqual([]);
  });

  it('should return the node plus every descendant that itself has children, deepest chain included', () => {
    const tree = buildItem('1', [buildItem('2', [buildItem('3', [buildItem('4', [buildItem('5', [buildItem('r1'), buildItem('r2')])])])])]);

    expect(collectExpandableIds(tree, getChildren)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('should walk every branch, not just the first', () => {
    const tree = buildItem('root', [buildItem('a', [buildItem('a1')]), buildItem('b', [buildItem('b1')]), buildItem('c')]);

    expect(collectExpandableIds(tree, getChildren)).toEqual(['root', 'a', 'b']);
  });
});
