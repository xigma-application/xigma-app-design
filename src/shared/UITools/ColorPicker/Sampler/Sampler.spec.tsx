import { fireEvent, render, screen } from '@testing-library/react';

// components
import Sampler from './Sampler';
import { TooltipProvider } from 'shared';

const renderSampler = (onClick?: TFunc): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Sampler onClick={onClick} />
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
  it('should call onClick when clicked', () => {
    // mock
    const onClick = vi.fn();

    // before
    renderSampler(onClick);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(onClick).toHaveBeenCalledTimes(1);
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
