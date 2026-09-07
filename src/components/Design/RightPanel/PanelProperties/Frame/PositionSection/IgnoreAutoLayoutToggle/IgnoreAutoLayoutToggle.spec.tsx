import { render, screen } from '@testing-library/react';

// components
import IgnoreAutoLayoutToggle from './IgnoreAutoLayoutToggle';
import { TooltipProvider } from 'shared';

const renderToggle = (overrides: Partial<Parameters<typeof IgnoreAutoLayoutToggle>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <IgnoreAutoLayoutToggle active={false} onToggle={vi.fn()} show {...overrides} />
    </TooltipProvider>,
  );

describe('IgnoreAutoLayoutToggle snapshots', () => {
  it('should render the inactive button', () => {
    // before
    const { asFragment } = renderToggle();

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the active button', () => {
    // before
    const { asFragment } = renderToggle({ active: true });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('IgnoreAutoLayoutToggle behaviors', () => {
  it('should render nothing when show is false', () => {
    // before
    const { container } = renderToggle({ show: false });

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should call onToggle when clicked', () => {
    // mock
    const onToggle = vi.fn();

    // before
    renderToggle({ onToggle });

    // action
    screen.getByLabelText('Ignore auto layout').click();

    // result
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should reflect the active state via aria-pressed', () => {
    // before
    renderToggle({ active: true });

    // result
    expect(screen.getByLabelText('Ignore auto layout')).toHaveAttribute('aria-pressed', 'true');
  });
});
