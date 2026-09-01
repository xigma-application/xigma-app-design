// types
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { getDropInsideIndex } from '../getDropInsideIndex';

type TItem = TTreeItem;

const buildRow = (id: string, overrides: Partial<TTreeRow<TItem>> = {}): TTreeRow<TItem> => ({
  canHaveChildren: false,
  depth: 0,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem: null,
  ...overrides,
});

describe('getDropInsideIndex', () => {
  it('should target a collapsed container when the pointer is in its middle band', () => {
    // mock
    const rows = [buildRow('leaf'), buildRow('group', { canHaveChildren: true })];

    // action
    const result = getDropInsideIndex(rows, { index: 1, offsetRatio: 0.5 }, ['leaf']);

    // result
    expect(result).toBe(1);
  });

  it('should not target the row when the pointer sits in the top edge band', () => {
    // mock
    const rows = [buildRow('group', { canHaveChildren: true })];

    // action
    const result = getDropInsideIndex(rows, { index: 0, offsetRatio: 0.1 }, ['x']);

    // result
    expect(result).toBeNull();
  });

  it('should also target an already-expanded container', () => {
    // mock
    const rows = [buildRow('group', { canHaveChildren: true, hasChildren: true, isExpanded: true })];

    // action
    const result = getDropInsideIndex(rows, { index: 0, offsetRatio: 0.5 }, ['x']);

    // result
    expect(result).toBe(0);
  });

  it('should not target a leaf row', () => {
    // mock
    const rows = [buildRow('leaf')];

    // action
    const result = getDropInsideIndex(rows, { index: 0, offsetRatio: 0.5 }, ['x']);

    // result
    expect(result).toBeNull();
  });

  it('should reject dropping a container into itself', () => {
    // mock
    const rows = [buildRow('group', { canHaveChildren: true })];

    // action
    const result = getDropInsideIndex(rows, { index: 0, offsetRatio: 0.5 }, ['group']);

    // result
    expect(result).toBeNull();
  });

  it('should reject dropping a container onto one of its own descendants', () => {
    // mock — dragging "group" (expanded) over its own collapsed child container
    const rows = [
      buildRow('group', { canHaveChildren: true, hasChildren: true, isExpanded: true }),
      buildRow('child-group', { canHaveChildren: true, depth: 1 }),
    ];

    // action
    const result = getDropInsideIndex(rows, { index: 1, offsetRatio: 0.5 }, ['group']);

    // result
    expect(result).toBeNull();
  });
});
