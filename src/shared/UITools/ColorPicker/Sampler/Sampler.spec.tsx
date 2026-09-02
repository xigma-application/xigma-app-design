import { fireEvent, render, screen } from '@testing-library/react';

// components
import Sampler from './Sampler';
import { TooltipProvider } from 'shared';

const renderSampler = (onOpen?: TFunc, onClose?: TFunc): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Sampler onClose={onClose} onOpen={onOpen} />
    </TooltipProvider>,
  );

describe('Sampler snapshots', () => {
  it('should render Sampler', () => {
    // before
    const { asFragment } = renderSampler(vi.fn());

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Sampler behaviors', () => {
  it('should call onOpen when clicked', () => {
    // mock
    const onOpen = vi.fn();

    // before
    renderSampler(onOpen);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicked again while open', () => {
    // mock
    const onOpen = vi.fn();
    const onClose = vi.fn();

    // before
    renderSampler(onOpen, onClose);

    // action
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render the icon in blue once opened', () => {
    // before
    renderSampler(vi.fn());

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(screen.getByRole('button').querySelector('svg')).toHaveStyle({ color: 'var(--color-blue-1)' });
  });
});
