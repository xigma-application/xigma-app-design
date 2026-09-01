// types
import { TSpringLoad } from '../../../types';

// utils
import { clearSpringLoad } from '../clearSpringLoad';

describe('clearSpringLoad', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should cancel the pending timer and drop the reference', () => {
    // spy
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const springLoadRef = { current: { itemId: 'group', timerId: 123 } as TSpringLoad | null };

    // action
    clearSpringLoad(springLoadRef);

    // result
    expect(clearTimeoutSpy).toHaveBeenCalledWith(123);
    expect(springLoadRef.current).toBeNull();
  });

  it('should be a no-op when nothing is scheduled', () => {
    // spy
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const springLoadRef = { current: null as TSpringLoad | null };

    // action
    clearSpringLoad(springLoadRef);

    // result
    expect(clearTimeoutSpy).not.toHaveBeenCalled();
  });
});
