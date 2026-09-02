import { renderHook } from '@testing-library/react';

// hooks
import { useFilteredActionsPanelSections } from '../useFilteredActionsPanelSections';

describe('useFilteredActionsPanelSections', () => {
  it('should group every item under its section, in section order, when the query is empty', () => {
    // before
    const { result } = renderHook(() => useFilteredActionsPanelSections(''));

    // result
    expect(result.current.map((group) => group.section)).toEqual(['recents', 'suggestions', 'commonSettings']);
    expect(result.current.flatMap((group) => group.items).length).toBeGreaterThan(0);
  });

  it('should filter items by a case-insensitive label match', () => {
    // before
    const { result } = renderHook(() => useFilteredActionsPanelSections('select'));

    // result
    const ids = result.current.flatMap((group) => group.items).map((item) => item.id);

    expect(ids).toEqual(['selectAll']);
  });

  it('should drop a section entirely once none of its items match the query', () => {
    // before
    const { result } = renderHook(() => useFilteredActionsPanelSections('select'));

    // result — "recents" has no item matching "select"
    expect(result.current.some((group) => group.section === 'recents')).toBe(false);
  });

  it('should return no sections when nothing matches', () => {
    // before
    const { result } = renderHook(() => useFilteredActionsPanelSections('xyz-nothing-matches'));

    // result
    expect(result.current).toEqual([]);
  });
});
