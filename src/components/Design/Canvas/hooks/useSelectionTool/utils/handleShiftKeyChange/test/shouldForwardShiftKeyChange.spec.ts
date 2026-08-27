// types
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { shouldForwardShiftKeyChange } from '../shouldForwardShiftKeyChange';

const POSITION = { x: 10, y: 20 };

const createSelectRefs = (overrides: Partial<TSelectionToolRefs>): TSelectionToolRefs =>
  ({ vectorEraseDragRef: { current: null }, vectorHandleDragRef: { current: null }, ...overrides }) as TSelectionToolRefs;

describe('shouldForwardShiftKeyChange', () => {
  it('should forward when Shift changes while a vector handle drag is in progress', () => {
    // mock
    const selectRefs = createSelectRefs({ vectorHandleDragRef: { current: {} } as TSelectionToolRefs['vectorHandleDragRef'] });

    // result
    expect(shouldForwardShiftKeyChange(new KeyboardEvent('keydown', { key: 'Shift' }), selectRefs, POSITION)).toBe(true);
  });

  it('should forward when Shift changes while a vector erase drag is in progress', () => {
    // mock
    const selectRefs = createSelectRefs({ vectorEraseDragRef: { current: {} } as TSelectionToolRefs['vectorEraseDragRef'] });

    // result
    expect(shouldForwardShiftKeyChange(new KeyboardEvent('keydown', { key: 'Shift' }), selectRefs, POSITION)).toBe(true);
  });

  it('should not forward a non-Shift key even mid-drag', () => {
    // mock
    const selectRefs = createSelectRefs({ vectorHandleDragRef: { current: {} } as TSelectionToolRefs['vectorHandleDragRef'] });

    // result
    expect(shouldForwardShiftKeyChange(new KeyboardEvent('keydown', { key: 'Alt' }), selectRefs, POSITION)).toBe(false);
  });

  it('should not forward Shift when no vector drag is in progress', () => {
    // mock
    const selectRefs = createSelectRefs({});

    // result
    expect(shouldForwardShiftKeyChange(new KeyboardEvent('keydown', { key: 'Shift' }), selectRefs, POSITION)).toBe(false);
  });

  it('should not forward Shift when there is no last pointer position yet', () => {
    // mock
    const selectRefs = createSelectRefs({ vectorHandleDragRef: { current: {} } as TSelectionToolRefs['vectorHandleDragRef'] });

    // result
    expect(shouldForwardShiftKeyChange(new KeyboardEvent('keydown', { key: 'Shift' }), selectRefs, null)).toBe(false);
  });
});
