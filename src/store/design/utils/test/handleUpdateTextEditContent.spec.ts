// types
import { TDesignState } from '../../types';

// utils
import { handleUpdateTextEditContent } from '../handleUpdateTextEditContent';

describe('handleUpdateTextEditContent', () => {
  it('should store the content being edited', () => {
    // mock
    const state = { editingTextContent: '' } as TDesignState;

    // before
    handleUpdateTextEditContent(state, 'Hello');

    // result
    expect(state.editingTextContent).toBe('Hello');
  });
});
