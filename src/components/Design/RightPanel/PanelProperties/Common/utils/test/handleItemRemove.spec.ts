// utils
import { handleItemRemove } from '../handleItemRemove';

describe('handleItemRemove', () => {
  it('should close the panel, clear the selection and commit the list without the item', () => {
    // mock
    const closeOpenPanel = vi.fn();
    const setSelectedIndices = vi.fn();
    const commit = vi.fn();

    // before
    handleItemRemove<string>(1, closeOpenPanel, setSelectedIndices, commit);

    // result
    expect(closeOpenPanel).toHaveBeenCalled();
    expect(setSelectedIndices).toHaveBeenCalledWith([]);
    expect(commit.mock.calls[0][0](['a', 'b', 'c'])).toEqual(['a', 'c']);
  });
});
