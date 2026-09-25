import { MouseEvent } from 'react';

// hooks
import { useHandleResizeMouseDown } from '../useHandleResizeMouseDown';

describe('useHandleResizeMouseDown', () => {
  it('should start a vertical resize that is not inverted', () => {
    // mock
    const onMouseDownY = vi.fn();
    const event = {} as MouseEvent<HTMLElement>;

    // before
    useHandleResizeMouseDown(onMouseDownY)(event);

    // result
    expect(onMouseDownY).toHaveBeenCalledWith(event, false);
  });
});
