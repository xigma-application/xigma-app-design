import { RefObject } from 'react';
import { renderHook } from '@testing-library/react';

// hooks
import { useVirtualList } from './useVirtualList';

// others
import { stubVirtualizerViewport } from 'test/stubVirtualizerViewport';

const makeScrollRef = (): RefObject<HTMLDivElement> => {
  const element = document.createElement('div');

  element.scrollTo = vi.fn();
  document.body.appendChild(element);

  return { current: element };
};

describe('useVirtualList', () => {
  beforeEach(() => {
    stubVirtualizerViewport(40);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should report the total size as count * rowHeight', () => {
    // before
    const { result } = renderHook(() => useVirtualList({ count: 10, rowHeight: 32, scrollRef: makeScrollRef() }));

    // result
    expect(result.current.totalSize).toBe(320);
  });

  it('should render only a slice of the rows, not all of them', () => {
    // before
    const { result } = renderHook(() => useVirtualList({ count: 1000, rowHeight: 32, scrollRef: makeScrollRef() }));

    // result
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.items.length).toBeLessThan(1000);
    expect(result.current.items[0].index).toBe(0);
  });

  it('should scroll the container when scrollToIndex changes to a valid index', () => {
    // mock
    const scrollRef = makeScrollRef();
    const { rerender } = renderHook(
      ({ scrollToIndex }: { scrollToIndex: number }) => useVirtualList({ count: 100, rowHeight: 32, scrollRef, scrollToIndex }),
      { initialProps: { scrollToIndex: -1 } },
    );
    (scrollRef.current.scrollTo as ReturnType<typeof vi.fn>).mockClear();

    // action
    rerender({ scrollToIndex: 80 });

    // result
    expect(scrollRef.current.scrollTo).toHaveBeenCalled();
  });
});
