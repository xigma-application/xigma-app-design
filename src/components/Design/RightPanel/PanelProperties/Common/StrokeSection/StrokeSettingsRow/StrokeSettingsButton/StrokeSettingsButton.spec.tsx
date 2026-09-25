import { fireEvent, render, screen } from '@testing-library/react';

// components
import StrokeSettingsButton from './StrokeSettingsButton';
import { TooltipProvider } from 'shared';

const state = { onClose: vi.fn(), onOpenChange: vi.fn(), open: false };

vi.mock('./hooks/useStrokeSettingsButton', () => ({ useStrokeSettingsButton: (): unknown => state }));
vi.mock('components/Design/RightPanel/hooks/usePanelEdgeSideOffset', () => ({ usePanelEdgeSideOffset: (): number => 8 }));
vi.mock('./StrokeSettingsPanel/StrokeSettingsPanel', () => ({ default: (): string => 'stroke settings panel' }));

const renderButton = (disabled?: boolean): void => {
  render(
    <TooltipProvider>
      <StrokeSettingsButton disabled={disabled} />
    </TooltipProvider>,
  );
};

describe('StrokeSettingsButton behaviors', () => {
  it('should request opening the settings from its button', () => {
    // mock
    state.open = false;

    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Advanced stroke settings'));

    // result
    expect(state.onOpenChange).toHaveBeenCalledWith(true);
  });

  it('should show the settings panel while open', () => {
    // mock
    state.open = true;

    // before
    renderButton();

    // result
    expect(screen.getByText('stroke settings panel')).toBeInTheDocument();
  });

  it('should keep the panel closed while disabled', () => {
    // mock
    state.open = true;

    // before
    renderButton(true);

    // result
    expect(screen.queryByText('stroke settings panel')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Advanced stroke settings', { selector: 'button' })).toBeDisabled();
  });
});
