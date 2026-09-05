import { fireEvent, render, screen } from '@testing-library/react';

// components
import PopoverScrollArea from './PopoverScrollArea';

const getContent = (container: HTMLElement): HTMLElement => container.querySelector('[class*="PopoverScrollArea__content"]') as HTMLElement;

const setContentMetrics = (content: HTMLElement, clientHeight: number, scrollHeight: number, scrollTop = 0): void => {
  Object.defineProperty(content, 'clientHeight', { configurable: true, value: clientHeight });
  Object.defineProperty(content, 'scrollHeight', { configurable: true, value: scrollHeight });
  content.scrollTop = scrollTop;
  fireEvent.scroll(content);
};

describe('PopoverScrollArea snapshots', () => {
  it('should render its children inside a scrollable content area', () => {
    // before
    const { asFragment } = render(
      <PopoverScrollArea>
        <span>item</span>
      </PopoverScrollArea>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PopoverScrollArea behaviors', () => {
  it('should render its children', () => {
    // before
    render(
      <PopoverScrollArea>
        <span>item</span>
      </PopoverScrollArea>,
    );

    // result
    expect(screen.getByText('item')).toBeInTheDocument();
  });

  it('should not render edge buttons when content does not overflow', () => {
    // before
    const { container } = render(
      <PopoverScrollArea>
        <span>item</span>
      </PopoverScrollArea>,
    );

    // result
    expect(container.querySelector('[class*="PopoverScrollArea__edge"]')).toBeNull();
  });

  it('should reveal only the bottom edge button when scrolled to the top of overflowing content', () => {
    // before
    const { container } = render(
      <PopoverScrollArea>
        <span>item</span>
      </PopoverScrollArea>,
    );

    // action
    setContentMetrics(getContent(container), 100, 300, 0);

    // result
    expect(container.querySelector('[class*="PopoverScrollArea__edge--top"]')).toBeNull();
    expect(container.querySelector('[class*="PopoverScrollArea__edge--bottom"]')).not.toBeNull();
  });

  it('should reveal only the top edge button when scrolled to the bottom of overflowing content', () => {
    // before
    const { container } = render(
      <PopoverScrollArea>
        <span>item</span>
      </PopoverScrollArea>,
    );

    // action
    setContentMetrics(getContent(container), 100, 300, 200);

    // result
    expect(container.querySelector('[class*="PopoverScrollArea__edge--top"]')).not.toBeNull();
    expect(container.querySelector('[class*="PopoverScrollArea__edge--bottom"]')).toBeNull();
  });

  it('should auto-scroll the content down while the bottom edge button is hovered, and stop on mouse leave', () => {
    // mock
    let nextId = 0;
    const scheduled = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      nextId += 1;
      scheduled.set(nextId, cb);

      return nextId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      scheduled.delete(id);
    });
    const flush = (): void => {
      const [id] = scheduled.keys();
      const callback = id === undefined ? undefined : scheduled.get(id);

      if (id !== undefined) {
        scheduled.delete(id);
      }
      callback?.(0);
    };

    // before
    const { container } = render(
      <PopoverScrollArea>
        <span>item</span>
      </PopoverScrollArea>,
    );
    const content = getContent(container);
    setContentMetrics(content, 100, 300, 0);
    const bottomEdge = container.querySelector('[class*="PopoverScrollArea__edge--bottom"]') as HTMLElement;

    // action
    fireEvent.mouseEnter(bottomEdge);
    flush();

    // result
    expect(content.scrollTop).toBeGreaterThan(0);

    // action
    fireEvent.mouseLeave(bottomEdge);
    const scrollTopAfterLeave = content.scrollTop;
    flush();

    // result
    expect(content.scrollTop).toBe(scrollTopAfterLeave);

    // cleanup
    vi.unstubAllGlobals();
  });

  it('should auto-scroll the content up while the top edge button is hovered, and stop on mouse leave', () => {
    // mock
    let nextId = 0;
    const scheduled = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      nextId += 1;
      scheduled.set(nextId, cb);

      return nextId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      scheduled.delete(id);
    });
    const flush = (): void => {
      const [id] = scheduled.keys();
      const callback = id === undefined ? undefined : scheduled.get(id);

      if (id !== undefined) {
        scheduled.delete(id);
      }
      callback?.(0);
    };

    // before
    const { container } = render(
      <PopoverScrollArea>
        <span>item</span>
      </PopoverScrollArea>,
    );
    const content = getContent(container);
    setContentMetrics(content, 100, 300, 200);
    const topEdge = container.querySelector('[class*="PopoverScrollArea__edge--top"]') as HTMLElement;

    // action
    fireEvent.mouseEnter(topEdge);
    flush();

    // result
    expect(content.scrollTop).toBeLessThan(200);

    // action
    fireEvent.mouseLeave(topEdge);
    const scrollTopAfterLeave = content.scrollTop;
    flush();

    // result
    expect(content.scrollTop).toBe(scrollTopAfterLeave);

    // cleanup
    vi.unstubAllGlobals();
  });
});
