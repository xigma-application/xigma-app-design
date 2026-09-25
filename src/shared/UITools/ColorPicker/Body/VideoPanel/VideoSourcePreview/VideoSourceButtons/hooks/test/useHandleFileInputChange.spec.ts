import { ChangeEvent } from 'react';

// hooks
import { useHandleFileInputChange } from '../useHandleFileInputChange';

const buildEvent = (files: File[] | null): ChangeEvent<HTMLInputElement> =>
  ({ target: { files, value: 'C:\\fakepath\\clip.mp4' } }) as unknown as ChangeEvent<HTMLInputElement>;

describe('useHandleFileInputChange', () => {
  it('should hand the picked file over and clear the input so the same file can be picked again', () => {
    // mock
    const onSelectFile = vi.fn();
    const file = new File([''], 'clip.mp4');
    const event = buildEvent([file]);

    // before
    useHandleFileInputChange(onSelectFile)(event);

    // result
    expect(onSelectFile).toHaveBeenCalledWith(file);
    expect(event.target.value).toBe('');
  });

  it('should do nothing but clear the input when no file was picked', () => {
    // mock
    const onSelectFile = vi.fn();
    const event = buildEvent(null);

    // before
    useHandleFileInputChange(onSelectFile)(event);

    // result
    expect(onSelectFile).not.toHaveBeenCalled();
    expect(event.target.value).toBe('');
  });
});
