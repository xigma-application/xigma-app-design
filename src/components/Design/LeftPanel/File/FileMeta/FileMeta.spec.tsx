import { render, screen } from '@testing-library/react';

// components
import FileMeta from './FileMeta';

describe('FileMeta snapshots', () => {
  it('should render FileMeta', () => {
    // before
    const { asFragment } = render(<FileMeta />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FileMeta behaviors', () => {
  it('should render a clickable Drafts link', () => {
    // before
    render(<FileMeta />);

    // result
    expect(screen.getByRole('button', { name: 'Drafts' })).toBeInTheDocument();
  });

  it('should render the Free subscription chip', () => {
    // before
    render(<FileMeta />);

    // result
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});
