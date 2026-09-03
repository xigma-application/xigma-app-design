import { render, screen } from '@testing-library/react';

// components
import Snackbar from './Snackbar';

describe('Snackbar snapshots', () => {
  it('should render Snackbar', () => {
    // before
    const { asFragment } = render(<Snackbar>Content</Snackbar>);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Snackbar behaviors', () => {
  it('should render its children', () => {
    // before
    render(
      <Snackbar>
        <span>Hello</span>
      </Snackbar>,
    );

    // result
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should merge a caller-provided className with its own root class', () => {
    // before
    const { container } = render(<Snackbar className="custom">Hello</Snackbar>);

    // result
    expect(container.firstChild).toHaveClass('custom');
  });
});
