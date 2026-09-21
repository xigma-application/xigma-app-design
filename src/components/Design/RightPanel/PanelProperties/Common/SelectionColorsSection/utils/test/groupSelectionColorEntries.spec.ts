// types
import { TSelectionColorEntry } from '../getSelectionColorOccurrenceEntries';

// utils
import { groupSelectionColorEntries } from '../groupSelectionColorEntries';

describe('groupSelectionColorEntries', () => {
  it('should keep two different colors as two groups', () => {
    // mock
    const entries: TSelectionColorEntry[] = [
      { occurrence: { index: 0, nodeId: 'a', property: 'fills' }, paint: { color: '#ff0000', opacity: 100, type: 'solid' } },
      { occurrence: { index: 0, nodeId: 'b', property: 'fills' }, paint: { color: '#0000ff', opacity: 100, type: 'solid' } },
    ];

    // result
    expect(groupSelectionColorEntries(entries)).toHaveLength(2);
  });

  it('should merge two entries sharing the same signature into one group with both occurrences', () => {
    // mock
    const paint = { color: '#ff0000', opacity: 100, type: 'solid' } as const;
    const entries: TSelectionColorEntry[] = [
      { occurrence: { index: 0, nodeId: 'a', property: 'fills' }, paint },
      { occurrence: { index: 0, nodeId: 'b', property: 'strokes' }, paint },
    ];

    // result
    const groups = groupSelectionColorEntries(entries);

    expect(groups).toHaveLength(1);
    expect(groups[0].occurrences).toEqual([
      { index: 0, nodeId: 'a', property: 'fills' },
      { index: 0, nodeId: 'b', property: 'strokes' },
    ]);
  });

  it('should keep a pinned occurrence out of a matching group, even though its value now equals it', () => {
    // mock — "a" was edited live to blue, matching "b", but "a" is pinned (its row is still open)
    const entries: TSelectionColorEntry[] = [
      { occurrence: { index: 0, nodeId: 'a', property: 'fills' }, paint: { color: '#0000ff', opacity: 100, type: 'solid' } },
      { occurrence: { index: 0, nodeId: 'b', property: 'fills' }, paint: { color: '#0000ff', opacity: 100, type: 'solid' } },
    ];

    // result
    const groups = groupSelectionColorEntries(entries, [{ index: 0, nodeId: 'a', property: 'fills' }]);

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.occurrences[0].nodeId === 'a')?.occurrences).toEqual([
      { index: 0, nodeId: 'a', property: 'fills' },
    ]);
  });

  it('should still merge several pinned occurrences with each other, just not with anything outside the pin', () => {
    // mock — "a" and "b" are both pinned (the row they were opened as), "c" happens to share the same value
    const paint = { color: '#0000ff', opacity: 100, type: 'solid' } as const;
    const entries: TSelectionColorEntry[] = [
      { occurrence: { index: 0, nodeId: 'a', property: 'fills' }, paint },
      { occurrence: { index: 0, nodeId: 'c', property: 'fills' }, paint },
      { occurrence: { index: 0, nodeId: 'b', property: 'fills' }, paint },
    ];

    // result
    const groups = groupSelectionColorEntries(entries, [
      { index: 0, nodeId: 'a', property: 'fills' },
      { index: 0, nodeId: 'b', property: 'fills' },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].occurrences).toEqual([
      { index: 0, nodeId: 'a', property: 'fills' },
      { index: 0, nodeId: 'b', property: 'fills' },
    ]);
    expect(groups[1].occurrences).toEqual([{ index: 0, nodeId: 'c', property: 'fills' }]);
  });
});
