import { fireEvent, render, screen } from '@testing-library/react';

// components
import ButtonIcon from './ButtonIcon';

describe('ButtonIcon snapshots', () => {
  it('should render ButtonIcon in its default state', () => {
    // before
    const { asFragment } = render(<ButtonIcon ariaLabel="Align left" name="AlignHorizontalLeft" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render ButtonIcon in its selected state', () => {
    // before
    const { asFragment } = render(<ButtonIcon ariaLabel="Align left" name="AlignHorizontalLeft" selected />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render ButtonIcon in its disabled state', () => {
    // before
    const { asFragment } = render(<ButtonIcon ariaLabel="Align left" disabled name="AlignHorizontalLeft" />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ButtonIcon behaviors', () => {
  it('should call onClick when clicked', () => {
    // mock
    const onClick = vi.fn();

    // before
    render(<ButtonIcon ariaLabel="Align left" name="AlignHorizontalLeft" onClick={onClick} />);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    // mock
    const onClick = vi.fn();

    // before
    render(<ButtonIcon ariaLabel="Align left" disabled name="AlignHorizontalLeft" onClick={onClick} />);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should render the icon at a fixed 24px size', () => {
    // before
    const { container } = render(<ButtonIcon ariaLabel="Align left" name="AlignHorizontalLeft" />);

    // find
    const icon = container.querySelector('svg');

    // result
    expect(icon).toHaveAttribute('height', '24');
    expect(icon).toHaveAttribute('width', '24');
  });
});
