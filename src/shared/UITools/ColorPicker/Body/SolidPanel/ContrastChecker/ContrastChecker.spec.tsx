import { fireEvent, render, screen } from '@testing-library/react';

// components
import ContrastChecker, { TContrastCheckerProps } from './ContrastChecker';
import { TooltipProvider } from 'shared';

// types
import { ContrastCategory, ContrastLevel } from './enums';

const renderContrastChecker = (overrides: Partial<TContrastCheckerProps> = {}): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ContrastChecker
        backgroundColor="#535353"
        canShowAAA={false}
        category={ContrastCategory.auto}
        foregroundColor="#f2adad"
        level={ContrastLevel.aa}
        onAutoCorrect={vi.fn()}
        onSetCategory={vi.fn()}
        onSetLevel={vi.fn()}
        passes
        ratio={7.69}
        {...overrides}
      />
    </TooltipProvider>,
  );

describe('ContrastChecker', () => {
  it('should show the ratio, the level badge, and its pass state', () => {
    // before
    renderContrastChecker({ passes: true, ratio: 7.69 });

    // result
    expect(screen.getByText('7.69 : 1')).toBeInTheDocument();
    expect(screen.getByText('AA')).toBeInTheDocument();
  });

  it('should show a fallback label instead of a ratio when there is no background to compare against', () => {
    // before
    renderContrastChecker({ ratio: null });

    // result
    expect(screen.queryByText(/:\s*1/)).not.toBeInTheDocument();
  });

  it('should not show the level badge when there is no ratio to evaluate', () => {
    // before
    renderContrastChecker({ ratio: null });

    // result
    expect(screen.queryByText('AA')).not.toBeInTheDocument();
  });

  it('should disable the auto-correct control when already passing', () => {
    // before
    renderContrastChecker({ passes: true });

    // result
    expect(screen.getByRole('button', { name: 'Auto-correct to the nearest compliant color' })).toBeDisabled();
  });

  it('should enable the auto-correct control when failing', () => {
    // before
    renderContrastChecker({ passes: false });

    // result
    expect(screen.getByRole('button', { name: 'Auto-correct to the nearest compliant color' })).not.toBeDisabled();
  });

  it('should call onAutoCorrect when the ratio control is clicked while failing', () => {
    // mock
    const onAutoCorrect = vi.fn();

    // before
    renderContrastChecker({ onAutoCorrect, passes: false });

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Auto-correct to the nearest compliant color' }));

    // result
    expect(onAutoCorrect).toHaveBeenCalled();
  });

  it('should open the settings menu listing category and level options when the settings button is clicked', () => {
    // before
    renderContrastChecker();

    // action
    fireEvent.click(screen.getByLabelText('Contrast checker settings'));

    // result
    expect(screen.getByText('Graphics')).toBeInTheDocument();
    expect(screen.getByText('AAA')).toBeInTheDocument();
  });

  it('should mark the settings button selected while its menu is open', () => {
    // before
    renderContrastChecker();
    const button = screen.getByLabelText('Contrast checker settings');

    expect(button.className).not.toContain('ButtonIcon--selected');

    // action
    fireEvent.click(button);

    // result
    expect(button.className).toContain('ButtonIcon--selected');
  });
});
