import { fireEvent, render, screen } from '@testing-library/react';
import { TFunction } from 'i18next';

// components
import { CornerRadiusButtonIcons } from './CornerRadiusButtonIcons';
import { TooltipProvider } from 'shared';

const t = ((key: string): string => key) as TFunction;

describe('CornerRadiusButtonIcons behaviors', () => {
  it('should toggle individual corners from its button', () => {
    // mock
    const onToggle = vi.fn();

    // before
    render(<TooltipProvider>{CornerRadiusButtonIcons(false, onToggle, t)}</TooltipProvider>);

    // find
    const button = screen.getByRole('button');

    // action
    fireEvent.click(button);

    // result
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('aria-label')).toContain('individualAriaLabel');
  });
});
