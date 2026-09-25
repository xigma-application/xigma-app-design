import { MouseEvent } from 'react';

// hooks
import { useHandleResizeMouseDown } from '../useHandleResizeMouseDown';

describe('useHandleResizeMouseDown', () => {
  it('should start an inverted horizontal resize for the right panel', () => {
    // mock
    const onMouseDownX = vi.fn();
    const event = {} as MouseEvent<HTMLElement>;

    // before
    useHandleResizeMouseDown(onMouseDownX)(event);

    // result
    expect(onMouseDownX).toHaveBeenCalledWith(event, true);
  });
});
