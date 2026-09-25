// hooks
import { useTriggerFileInput } from '../useTriggerFileInput';

describe('useTriggerFileInput', () => {
  it('should open the file picker of the referenced input', () => {
    // mock
    const input = document.createElement('input');

    // spy
    const click = vi.spyOn(input, 'click');

    // before
    useTriggerFileInput({ current: input })();

    // result
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('should do nothing while the input is not mounted', () => {
    // result
    expect(() => useTriggerFileInput({ current: null })()).not.toThrow();
  });
});
