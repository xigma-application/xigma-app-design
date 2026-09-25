// types
import { TSmartSelectionSuggestion } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionSuggestionKind } from '../getSmartSelectionSuggestionKind';

const suggestion = (type: string, axis?: 'x' | 'y'): TSmartSelectionSuggestion => ({ axis, type }) as unknown as TSmartSelectionSuggestion;

describe('getSmartSelectionSuggestionKind', () => {
  it('should show a grid icon for grid suggestions', () => {
    // result
    expect(getSmartSelectionSuggestionKind(suggestion('grid-equalize'))).toBe('grid');
    expect(getSmartSelectionSuggestionKind(suggestion('grid-append'))).toBe('grid');
  });

  it('should show a row or column icon by the axis of other suggestions', () => {
    // result
    expect(getSmartSelectionSuggestionKind(suggestion('append', 'x'))).toBe('row');
    expect(getSmartSelectionSuggestionKind(suggestion('equalize', 'y'))).toBe('column');
  });
});
