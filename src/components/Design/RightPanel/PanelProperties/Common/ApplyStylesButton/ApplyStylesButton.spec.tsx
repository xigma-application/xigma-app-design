import { fireEvent, render, screen } from '@testing-library/react';

// components
import ApplyStylesButton from './ApplyStylesButton';
import { TooltipProvider } from 'shared';

describe('ApplyStylesButton behaviors', () => {
  it('should render a button labeled "Apply styles and variables"', () => {
    // before
    render(
      <TooltipProvider>
        <ApplyStylesButton ariaLabel="Apply styles and variables" tooltip="Apply styles and variables" />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByRole('button', { name: 'Apply styles and variables' })).toBeInTheDocument();
  });

  it('should not throw when clicked, since it has no function yet', () => {
    // before
    render(
      <TooltipProvider>
        <ApplyStylesButton ariaLabel="Apply styles and variables" tooltip="Apply styles and variables" />
      </TooltipProvider>,
    );

    // result
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'Apply styles and variables' }))).not.toThrow();
  });
});
