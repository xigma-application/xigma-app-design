// types
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { getDropDepthRange } from '../getDropDepthRange';

type TItem = TTreeItem;

const buildRow = (depth: number, id: string): TTreeRow<TItem> => ({
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem: null,
});

describe('getDropDepthRange', () => {
  it('should allow only depth 0 at the very top of the list', () => {
    // mock
    const rows = [buildRow(0, 'a'), buildRow(0, 'b')];

    // action & result
    expect(getDropDepthRange(rows, 0)).toEqual({ max: 0, min: 0 });
  });

  it('should allow only depth 0 at the very bottom of a flat list', () => {
    // mock
    const rows = [buildRow(0, 'a'), buildRow(0, 'b')];

    // action & result
    expect(getDropDepthRange(rows, 2)).toEqual({ max: 0, min: 0 });
  });

  it('should span from the shallower to the deeper neighboring row', () => {
    // mock — gap right after a group's expanded first child, before a sibling at depth 0
    const rows = [buildRow(0, 'group'), buildRow(1, 'child'), buildRow(0, 'sibling')];

    // action & result — the gap between 'child' (depth 1) and 'sibling' (depth 0) spans [0, 1]
    expect(getDropDepthRange(rows, 2)).toEqual({ max: 1, min: 0 });
  });

  it('should reproduce a deep ancestor chain of valid drop depths', () => {
    // mock — Group0(0) > Group1(1) > c(2), then a top-level sibling X(0)
    const rows = [buildRow(0, 'group0'), buildRow(1, 'group1'), buildRow(2, 'c'), buildRow(0, 'x')];

    // action & result — the gap after 'c' (depth 2) and before 'x' (depth 0) spans every ancestor level
    expect(getDropDepthRange(rows, 3)).toEqual({ max: 2, min: 0 });
  });
});
