import { fireEvent, render, screen } from '@testing-library/react';

// components
import HomePage from './HomePage';

describe('HomePage snapshots', () => {
  it('should render HomePage', () => {
    // before
    const { asFragment } = render(<HomePage />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('HomePage behaviors', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should toggle the document theme and its own label when the theme button is clicked', () => {
    // before
    render(<HomePage />);

    // find
    const themeToggle = screen.getByRole('button', { name: 'Switch to light theme' });

    // action
    fireEvent.click(themeToggle);

    // result
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
  });
});
