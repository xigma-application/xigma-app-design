import { fireEvent, render, screen } from '@testing-library/react';

// components
import Chip from './Chip';

describe('Chip snapshots', () => {
  it('should render Chip with its default (free) variant', () => {
    // before
    const { asFragment } = render(<Chip>Free</Chip>);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render an interactive Chip as a button when onClick is provided', () => {
    // before
    const { asFragment } = render(
      <Chip onClick={vi.fn()} variant="secondary">
        Drafts
      </Chip>,
    );

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Chip behaviors', () => {
  it('should render its children', () => {
    // before
    render(<Chip>Free</Chip>);

    // result
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('should merge a caller-supplied className', () => {
    // before
    render(<Chip className="extra">Free</Chip>);

    // result
    expect(screen.getByText('Free')).toHaveClass('extra');
  });

  it('should render as a plain span with no onClick', () => {
    // before
    render(<Chip>Free</Chip>);

    // result
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Free').tagName).toBe('SPAN');
  });

  it('should render as a clickable button and call onClick when it has an action', () => {
    // mock
    const onClick = vi.fn();

    // before
    render(
      <Chip onClick={onClick} variant="secondary">
        Drafts
      </Chip>,
    );

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Drafts' }));

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
