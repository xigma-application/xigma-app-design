// types
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { shouldForwardModifierKeyChange } from '../shouldForwardModifierKeyChange';

const POSITION = { x: 10, y: 20 };

const createSelectRefs = (overrides: Partial<TSelectionToolRefs>): TSelectionToolRefs =>
  ({
    dragStateRef: { current: null },
    ...overrides,
  }) as TSelectionToolRefs;

describe('shouldForwardModifierKeyChange', () => {
  it('should forward when Control changes while a drag is in progress', () => {
    // mock
    const selectRefs = createSelectRefs({ dragStateRef: { current: {} } as TSelectionToolRefs['dragStateRef'] });

    // result
    expect(shouldForwardModifierKeyChange(new KeyboardEvent('keydown', { key: 'Control' }), selectRefs, POSITION)).toBe(true);
  });

  it('should forward when Meta changes while a drag is in progress', () => {
    // mock
    const selectRefs = createSelectRefs({ dragStateRef: { current: {} } as TSelectionToolRefs['dragStateRef'] });

    // result
    expect(shouldForwardModifierKeyChange(new KeyboardEvent('keyup', { key: 'Meta' }), selectRefs, POSITION)).toBe(true);
  });

  it('should not forward a non-modifier key even mid-drag', () => {
    // mock
    const selectRefs = createSelectRefs({ dragStateRef: { current: {} } as TSelectionToolRefs['dragStateRef'] });

    // result
    expect(shouldForwardModifierKeyChange(new KeyboardEvent('keydown', { key: 'Shift' }), selectRefs, POSITION)).toBe(false);
  });

  it('should not forward when no drag is in progress', () => {
    // mock
    const selectRefs = createSelectRefs({});

    // result
    expect(shouldForwardModifierKeyChange(new KeyboardEvent('keydown', { key: 'Control' }), selectRefs, POSITION)).toBe(false);
  });

  it('should not forward when there is no last pointer position yet', () => {
    // mock
    const selectRefs = createSelectRefs({ dragStateRef: { current: {} } as TSelectionToolRefs['dragStateRef'] });

    // result
    expect(shouldForwardModifierKeyChange(new KeyboardEvent('keydown', { key: 'Control' }), selectRefs, null)).toBe(false);
  });
});
