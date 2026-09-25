// utils
import { handleEffectOpenChange } from '../handleEffectOpenChange';

describe('handleEffectOpenChange', () => {
  it('should select a row when its panel opens', () => {
    // mock
    const setSelectedIndices = vi.fn();
    const onPickerOpenChange = vi.fn();

    // before
    handleEffectOpenChange(1, true, setSelectedIndices, onPickerOpenChange);

    // result
    expect(setSelectedIndices).toHaveBeenCalledWith([1]);
    expect(onPickerOpenChange).toHaveBeenCalledWith(1, true);
  });

  it('should only report a closing panel', () => {
    // mock
    const setSelectedIndices = vi.fn();
    const onPickerOpenChange = vi.fn();

    // before
    handleEffectOpenChange(1, false, setSelectedIndices, onPickerOpenChange);

    // result
    expect(setSelectedIndices).not.toHaveBeenCalled();
    expect(onPickerOpenChange).toHaveBeenCalledWith(1, false);
  });
});
