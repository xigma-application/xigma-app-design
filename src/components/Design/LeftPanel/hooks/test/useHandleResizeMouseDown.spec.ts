import { MouseEvent } from 'react';

// hooks
import { useHandleResizeMouseDown } from '../useHandleResizeMouseDown';

describe('useHandleResizeMouseDown', () => {
  it('should start a horizontal resize that is not inverted', () => {
    // mock
    const onMouseDownX = vi.fn();
    const event = {} as MouseEvent<HTMLElement>;

    // before
    useHandleResizeMouseDown(onMouseDownX)(event);

    // result
    expect(onMouseDownX).toHaveBeenCalledWith(event, false);
  });
});
