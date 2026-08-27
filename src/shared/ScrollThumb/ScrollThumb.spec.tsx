import { render } from '@testing-library/react';

// components
import ScrollThumb from './ScrollThumb';

const createScrollElement = (clientHeight: number, scrollHeight: number): HTMLDivElement => {
  const element = document.createElement('div');

  Object.defineProperty(element, 'clientHeight', { configurable: true, value: clientHeight });
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: scrollHeight });

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
});
