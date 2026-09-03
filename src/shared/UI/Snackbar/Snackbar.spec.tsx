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

  it('should call onAutoHide once autoHideAfterMs has elapsed', () => {
    // mock
    vi.useFakeTimers();
    const onAutoHide = vi.fn();

    // before
    render(
      <Snackbar autoHideAfterMs={3000} onAutoHide={onAutoHide}>
        Hello
      </Snackbar>,
    );

    // action
    vi.advanceTimersByTime(3000);

    // result
    expect(onAutoHide).toHaveBeenCalledTimes(1);

    // cleanup
    vi.useRealTimers();
  });

  it('should never auto-hide when autoHideAfterMs is not given', () => {
    // mock
    vi.useFakeTimers();
    const onAutoHide = vi.fn();

    // before
    render(<Snackbar onAutoHide={onAutoHide}>Hello</Snackbar>);

    // action
    vi.advanceTimersByTime(10000);

    // result
    expect(onAutoHide).not.toHaveBeenCalled();

    // cleanup
    vi.useRealTimers();
  });
});
