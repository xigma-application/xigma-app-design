// store
import { setSelection } from 'store/design/slice';

// utils
import { toggleSelectionOnPointerDown } from '../toggleSelectionOnPointerDown';

const context = (hit: unknown, shiftKey: boolean): Record<string, unknown> => ({
  currentSelection: ['a', 'b'],
  dispatch: vi.fn(),
  event: { shiftKey },
  hit,
});

describe('toggleSelectionOnPointerDown', () => {
  it('should toggle the hit layer in the selection with Shift held', () => {
    // mock
    const ctx = context({ id: 'b' }, true);

    // before
    const result = toggleSelectionOnPointerDown(ctx as never);

    // result
    expect(result).toBe(true);
    expect(ctx.dispatch).toHaveBeenCalledWith(setSelection(['a']));
  });

  it('should leave the pointer alone without Shift or without a hit', () => {
    // result
    expect(toggleSelectionOnPointerDown(context({ id: 'b' }, false) as never)).toBeUndefined();
    expect(toggleSelectionOnPointerDown(context(null, true) as never)).toBeUndefined();
  });
});
