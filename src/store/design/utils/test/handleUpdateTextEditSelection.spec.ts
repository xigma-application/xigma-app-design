// types
import { TDesignState } from '../../types';

// utils
import { handleUpdateTextEditSelection } from '../handleUpdateTextEditSelection';

describe('handleUpdateTextEditSelection', () => {
  it('should store the selection range and when it changed', () => {
    // mock
    const state = {} as TDesignState;

    // spy
    vi.spyOn(Date, 'now').mockReturnValue(1234);

    // before
    handleUpdateTextEditSelection(state, { end: 5, start: 2 });

    // result
    expect(state).toMatchObject({ editingSelectionChangedAt: 1234, editingSelectionEnd: 5, editingSelectionStart: 2 });
  });
});
