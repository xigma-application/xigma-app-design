import { fireEvent, render, screen } from '@testing-library/react';
import { TFunction } from 'i18next';

// components
import { ColumnPaddingButtonIcons } from './ColumnPaddingButtonIcons';
import { TooltipProvider } from 'shared';

const t = ((key: string): string => key) as TFunction;

describe('ColumnPaddingButtonIcons behaviors', () => {
  it('should toggle individual padding from its button, showing whether it is on', () => {
    // mock
    const onToggle = vi.fn();

    // before
    render(<TooltipProvider>{ColumnPaddingButtonIcons(true, onToggle, t)}</TooltipProvider>);

    // find
    const button = screen.getByRole('button');

    // action
    fireEvent.click(button);

    // result
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(button.getAttribute('aria-label')).toContain('individualAriaLabel');
  });
});
