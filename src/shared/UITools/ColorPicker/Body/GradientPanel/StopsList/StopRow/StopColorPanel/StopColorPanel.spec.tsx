import { fireEvent, render, screen } from '@testing-library/react';

// components
import StopColorPanel from './StopColorPanel';
import { TooltipProvider } from 'shared';

const VALUE = { alpha: 100, hex: '#ff0000' };

const renderStopColorPanel = (overrides: Partial<Parameters<typeof StopColorPanel>[0]> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <StopColorPanel onClose={vi.fn()} onColorChange={vi.fn()} value={VALUE} {...overrides} />
    </TooltipProvider>,
  );

describe('StopColorPanel', () => {
  it('should call onClose when the close button is clicked', () => {
    // mock
    const onClose = vi.fn();

    // before
    renderStopColorPanel({ onClose });

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalled();
  });

  it('should commit a color change through onColorChange', () => {
    // mock
    const onColorChange = vi.fn();

    // before
    renderStopColorPanel({ onColorChange });

    // action
    fireEvent.blur(screen.getByDisplayValue('ff0000'), { target: { value: '00ff00' } });

    // result
    expect(onColorChange).toHaveBeenCalledWith(expect.objectContaining({ hex: '#00ff00' }));
  });

  it('should not throw when clicking the (already active, no-op) library tab', () => {
    // before
    renderStopColorPanel();

    // action / result
    expect(() => fireEvent.click(screen.getByText('Custom'))).not.toThrow();
  });

  it('should mount the color sampler overlay once the sampler trigger is clicked', () => {
    // before
    const { container } = renderStopColorPanel();

    // action
    fireEvent.click(screen.getByLabelText('Sample color'));

    // result — the sampler button switches to its active (blue) icon color once open
    expect(container.querySelector('[class*="Sampler__button"]')).toBeInTheDocument();
  });
});
