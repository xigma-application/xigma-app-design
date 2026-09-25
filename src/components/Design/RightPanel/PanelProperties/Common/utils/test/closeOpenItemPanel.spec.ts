// utils
import { closeOpenItemPanel } from '../closeOpenItemPanel';

describe('closeOpenItemPanel', () => {
  it('should close the open item panel', () => {
    // mock
    const onPickerOpenChange = vi.fn();

    // before
    closeOpenItemPanel(2, onPickerOpenChange);

    // result
    expect(onPickerOpenChange).toHaveBeenCalledWith(2, false);
  });

  it('should do nothing when no panel is open', () => {
    // mock
    const onPickerOpenChange = vi.fn();

    // before
    closeOpenItemPanel(null, onPickerOpenChange);

    // result
    expect(onPickerOpenChange).not.toHaveBeenCalled();
  });
});
