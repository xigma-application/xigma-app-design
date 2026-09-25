import { ChangeEvent } from 'react';

// hooks
import { useHandleZoomInputChange } from '../useHandleZoomInputChange';

describe('useHandleZoomInputChange', () => {
  it('should keep only the digits typed into the zoom field', () => {
    // mock
    const setValue = vi.fn();

    // before
    useHandleZoomInputChange(setValue)({ currentTarget: { value: '1a2%5' } } as ChangeEvent<HTMLInputElement>);

    // result
    expect(setValue).toHaveBeenCalledWith('125');
  });
});
