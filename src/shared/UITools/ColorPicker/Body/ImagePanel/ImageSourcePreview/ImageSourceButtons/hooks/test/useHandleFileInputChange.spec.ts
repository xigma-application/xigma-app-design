import { ChangeEvent } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useHandleFileInputChange } from '../useHandleFileInputChange';

const createEvent = (files: File[]): ChangeEvent<HTMLInputElement> =>
  ({ target: { files, value: 'some-value' } }) as unknown as ChangeEvent<HTMLInputElement>;

describe('useHandleFileInputChange', () => {
  it('should call onSelectFile with the chosen file and reset the input value', () => {
    // mock
    const onSelectFile = vi.fn();
    const file = new File(['content'], 'photo.png', { type: 'image/png' });

    // before
    const { result } = renderHook(() => useHandleFileInputChange(onSelectFile));
    const event = createEvent([file]);

    // action
    result.current(event);

    // result
    expect(onSelectFile).toHaveBeenCalledWith(file);
    expect(event.target.value).toBe('');
  });

  it('should do nothing when no file was chosen', () => {
    // mock
    const onSelectFile = vi.fn();

    // before
    const { result } = renderHook(() => useHandleFileInputChange(onSelectFile));
    const event = createEvent([]);

    // action
    result.current(event);

    // result
    expect(onSelectFile).not.toHaveBeenCalled();
  });
});
