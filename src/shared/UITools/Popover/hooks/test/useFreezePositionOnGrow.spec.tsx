import { renderHook, waitFor } from '@testing-library/react';

// hooks
import { useFreezePositionOnGrow } from '../useFreezePositionOnGrow';

const createWrappedNode = (): { node: HTMLDivElement; wrapper: HTMLDivElement } => {
  const wrapper = document.createElement('div');
  const node = document.createElement('div');

  wrapper.appendChild(node);
  document.body.appendChild(wrapper);

  return { node, wrapper };
};

describe('useFreezePositionOnGrow', () => {
  it('should do nothing when disabled', () => {
    // before
    const { result } = renderHook(() => useFreezePositionOnGrow(false));
    const { node, wrapper } = createWrappedNode();

    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({ bottom: 100, top: 50 } as DOMRect);

    // action
    result.current(node);
    wrapper.style.transform = 'translate(10px, 20px)';

    // result — untouched, no observer was ever attached
    expect(wrapper.style.transform).toBe('translate(10px, 20px)');
  });

  it('should not throw when attached to a node with no parent', () => {
    // before
    const { result } = renderHook(() => useFreezePositionOnGrow(true));
    const node = document.createElement('div');

    // result
    expect(() => result.current(node)).not.toThrow();
  });

  it('should not throw when detached with a null node', () => {
    // before
    const { result } = renderHook(() => useFreezePositionOnGrow(true));

    // result
    expect(() => result.current(null)).not.toThrow();
  });

  it('should not freeze the transform while the wrapper is still off-screen', () => {
    // before
    const { result } = renderHook(() => useFreezePositionOnGrow(true));
    const { node, wrapper } = createWrappedNode();

    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({ bottom: 0, top: 0 } as DOMRect);

    // action
    result.current(node);
    wrapper.style.transform = 'translate(0, -200%)';

    // result — nothing was ever captured, so later writes are left alone
    expect(wrapper.style.transform).toBe('translate(0, -200%)');
  });

  it('should capture the first on-screen transform and revert any later change back to it', async () => {
    // before
    const { result } = renderHook(() => useFreezePositionOnGrow(true));
    const { node, wrapper } = createWrappedNode();

    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({ bottom: 400, top: 300 } as DOMRect);
    wrapper.style.transform = 'translate(10px, 300px)';

    // action — attaching captures the current, on-screen transform as frozen
    result.current(node);

    // result — a later reposition (simulating content growth pushing the panel up) gets reverted
    wrapper.style.transform = 'translate(10px, 120px)';
    await waitFor(() => expect(wrapper.style.transform).toBe('translate(10px, 300px)'));
  });

  it('should start capturing a fresh position after being detached and reattached', async () => {
    // before
    const { result } = renderHook(() => useFreezePositionOnGrow(true));
    const first = createWrappedNode();

    vi.spyOn(first.wrapper, 'getBoundingClientRect').mockReturnValue({ bottom: 400, top: 300 } as DOMRect);
    first.wrapper.style.transform = 'translate(0, 300px)';
    result.current(first.node);

    // action — detach (as Radix does on close), then attach a brand-new node (as on reopen)
    result.current(null);

    const second = createWrappedNode();

    vi.spyOn(second.wrapper, 'getBoundingClientRect').mockReturnValue({ bottom: 500, top: 450 } as DOMRect);
    second.wrapper.style.transform = 'translate(0, 450px)';
    result.current(second.node);

    // result — the new position is captured fresh, not the stale one from the previous open
    second.wrapper.style.transform = 'translate(0, 100px)';
    await waitFor(() => expect(second.wrapper.style.transform).toBe('translate(0, 450px)'));
  });
});
