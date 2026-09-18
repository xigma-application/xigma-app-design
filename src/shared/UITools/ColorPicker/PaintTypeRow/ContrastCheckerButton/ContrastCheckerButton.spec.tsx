import { fireEvent, render, screen } from '@testing-library/react';

// components
import ContrastCheckerButton from './ContrastCheckerButton';
import { TooltipProvider } from 'shared';

const renderContrastCheckerButton = (isActive = false, onToggle: TFunc = vi.fn()): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ContrastCheckerButton isActive={isActive} onToggle={onToggle} />
    </TooltipProvider>,
  );

describe('ContrastCheckerButton', () => {
  it('should render inactive by default', () => {
    // before
    renderContrastCheckerButton(false);

    // result
    expect(screen.getByLabelText('Check color contrast').className).not.toContain('ButtonIcon--selected');
  });

  it('should render active when isActive is true', () => {
    // before
    renderContrastCheckerButton(true);

    // result
    expect(screen.getByLabelText('Check color contrast').className).toContain('ButtonIcon--selected');
  });

  it('should call onToggle when clicked', () => {
    // mock
    const onToggle = vi.fn();

    // before
    renderContrastCheckerButton(false, onToggle);

    // action
    fireEvent.click(screen.getByLabelText('Check color contrast'));

    // result
    expect(onToggle).toHaveBeenCalled();
  });
});
