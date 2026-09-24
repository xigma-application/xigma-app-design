import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import StrokeSettingsWidthProfileControl from './StrokeSettingsWidthProfileControl';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderControl = (props: { className?: string; disabled?: boolean } = {}): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <StrokeSettingsWidthProfileControl {...props} />
      </TooltipProvider>
    </Provider>,
  );

describe('StrokeSettingsWidthProfileControl behaviors', () => {
  it('should render the flip button', () => {
    // before
    renderControl();

    // result
    expect(screen.getByRole('button', { name: /flip/i })).toBeInTheDocument();
  });

  it('should disable the flip button when disabled', () => {
    // before
    renderControl({ disabled: true });

    // result
    expect(screen.getByRole('button', { name: /flip/i })).toBeDisabled();
  });

  it('should hand the className to its root', () => {
    // before
    const { container } = renderControl({ className: 'custom' });

    // result
    expect(container.querySelector('.custom')).not.toBeNull();
  });
});
