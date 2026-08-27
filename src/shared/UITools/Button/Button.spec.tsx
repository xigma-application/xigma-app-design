import { fireEvent, render, screen } from '@testing-library/react';

// components
import Button from './Button';

describe('Button snapshots', () => {
  it('should render Button in its default state', () => {
    // before
    const { asFragment } = render(<Button>Click</Button>);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render Button in its active state', () => {
    // before
    const { asFragment } = render(<Button active>Click</Button>);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render Button in its disabled state', () => {
    // before
    const { asFragment } = render(<Button disabled>Click</Button>);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Button behaviors', () => {
  it('should call onClick when clicked', () => {
    // mock
    const onClick = vi.fn();

    // before
    render(<Button onClick={onClick}>Click</Button>);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    // mock
    const onClick = vi.fn();

    // before
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>,
    );

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should expose aria-pressed matching the active prop', () => {
    // before
    render(<Button active>Click</Button>);

    // result
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});
