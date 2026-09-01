import { render } from '@testing-library/react';

// components
import ScrollThumb from './ScrollThumb';

const createScrollElement = (clientHeight: number, scrollHeight: number): HTMLDivElement => {
  const element = document.createElement('div');

  Object.defineProperty(element, 'clientHeight', { configurable: true, value: clientHeight });
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: scrollHeight });

  return element;
};

const createHorizontalScrollElement = (clientWidth: number, scrollWidth: number): HTMLDivElement => {
  const element = document.createElement('div');

  Object.defineProperty(element, 'clientWidth', { configurable: true, value: clientWidth });
  Object.defineProperty(element, 'scrollWidth', { configurable: true, value: scrollWidth });

  return element;
};

describe('ScrollThumb snapshots', () => {
  it('should render a thumb when the content overflows', () => {
    // before
    const { asFragment } = render(<ScrollThumb scrollRef={{ current: createScrollElement(84, 336) }} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render nothing when the content fits without scrolling', () => {
    // before
    const { asFragment } = render(<ScrollThumb scrollRef={{ current: createScrollElement(84, 84) }} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render a horizontal thumb sized from the width metrics', () => {
    // before
    const { container } = render(<ScrollThumb orientation="horizontal" scrollRef={{ current: createHorizontalScrollElement(84, 336) }} />);
    const thumb = container.firstElementChild as HTMLElement;

    // result
    expect(thumb.className).toMatch(/ScrollThumb--horizontal/);
    expect(thumb.style.width).toBe('25%');
    expect(thumb.style.height).toBe('');
  });

  it('should render nothing horizontally when the content fits', () => {
    // before
    const { container } = render(<ScrollThumb orientation="horizontal" scrollRef={{ current: createHorizontalScrollElement(84, 84) }} />);

    // result
    expect(container).toBeEmptyDOMElement();
  });
});
