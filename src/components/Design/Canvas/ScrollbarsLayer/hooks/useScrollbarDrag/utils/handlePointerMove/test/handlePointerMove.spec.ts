// store
import { setViewport } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { store } from 'store';

// utils
import { handlePointerMove } from '../handlePointerMove';

const anchor = { clientPos: 100, offset: 50, size: 100, trackLength: 500, viewportValue: 0, worldPerTrackPx: 2 };
const event = (clientX: number, clientY: number): PointerEvent & { stopPropagation: TFunc } =>
  ({ clientX, clientY, stopPropagation: vi.fn() }) as unknown as PointerEvent & { stopPropagation: TFunc };

describe('handlePointerMove', () => {
  it('should scroll the viewport opposite to the thumb movement', () => {
    // mock
    const dispatch = vi.fn();
    const moveEvent = event(130, 0);

    // before
    handlePointerMove(moveEvent, 'x', dispatch, { current: anchor });

    // result
    expect(dispatch).toHaveBeenCalledWith(setViewport({ ...selectViewport(store.getState()), x: -60 }));
    expect(moveEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should keep the thumb inside the track on the vertical axis', () => {
    // mock
    const dispatch = vi.fn();

    // before
    handlePointerMove(event(0, -500), 'y', dispatch, { current: anchor });

    // result
    expect(dispatch).toHaveBeenCalledWith(setViewport({ ...selectViewport(store.getState()), y: 100 }));
  });

  it('should do nothing without an anchored drag', () => {
    // mock
    const dispatch = vi.fn();

    // before
    handlePointerMove(event(0, 0), 'x', dispatch, { current: null });

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });
});
