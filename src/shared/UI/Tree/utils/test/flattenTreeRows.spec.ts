// utils
import { flattenTreeRows } from '../flattenTreeRows';

type TItem = { children?: TItem[]; id: string };

const leaf: TItem = { id: 'leaf' };
const emptyFolder: TItem = { children: [], id: 'empty' };
const folder: TItem = { children: [leaf], id: 'folder' };
const getChildren = (item: TItem): TItem[] | undefined => item.children;

describe('flattenTreeRows', () => {
  it('should list the roots with their child flags, skipping collapsed children', () => {
    // before
    const rows = flattenTreeRows([folder, emptyFolder, leaf], getChildren, new Set());

    // result
    expect(rows).toEqual([
      { canHaveChildren: true, depth: 0, hasChildren: true, isExpanded: false, item: folder, parentItem: null },
      { canHaveChildren: true, depth: 0, hasChildren: false, isExpanded: false, item: emptyFolder, parentItem: null },
      { canHaveChildren: false, depth: 0, hasChildren: false, isExpanded: false, item: leaf, parentItem: null },
    ]);
  });

  it('should walk into expanded items, one level deeper with the parent attached', () => {
    // before
    const rows = flattenTreeRows([folder, emptyFolder], getChildren, new Set(['folder', 'empty']));

    // result
    expect(rows).toEqual([
      { canHaveChildren: true, depth: 0, hasChildren: true, isExpanded: true, item: folder, parentItem: null },
      { canHaveChildren: false, depth: 1, hasChildren: false, isExpanded: false, item: leaf, parentItem: folder },
      { canHaveChildren: true, depth: 0, hasChildren: false, isExpanded: false, item: emptyFolder, parentItem: null },
    ]);
  });
});
