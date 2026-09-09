import { render } from '@testing-library/react';

// components
import GridAreaPreview from './GridAreaPreview';

describe('GridAreaPreview', () => {
  it('should render one cell per column x row and show the size caption', () => {
    const { container, getByText } = render(<GridAreaPreview columns="3" rows="2" />);

    expect(container.querySelectorAll('[class*="GridAreaPreview__cell"]')).toHaveLength(6);
    expect(getByText('×')).toBeInTheDocument();
    expect(container.textContent).toContain('3');
    expect(container.textContent).toContain('2');
  });

  it('should cap the drawn grid at 10 x 10 while still captioning the real counts', () => {
    const { container } = render(<GridAreaPreview columns="40" rows="30" />);

    expect(container.querySelectorAll('[class*="GridAreaPreview__cell"]')).toHaveLength(100);
    expect(container.textContent).toContain('40');
    expect(container.textContent).toContain('30');
  });

  it('should draw nothing when either count is not a number', () => {
    expect(render(<GridAreaPreview columns="" rows="2" />).container.querySelectorAll('[class*="GridAreaPreview__cell"]')).toHaveLength(0);
    expect(render(<GridAreaPreview columns="2" rows="" />).container.querySelectorAll('[class*="GridAreaPreview__cell"]')).toHaveLength(0);
  });
});
