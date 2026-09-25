import { fireEvent, render, screen } from '@testing-library/react';

// components
import VisibilityToggle from './VisibilityToggle';
import { TooltipProvider } from 'shared';

const state = { hidden: false, onToggle: vi.fn() };

vi.mock('./hooks/useVisibilityToggle', () => ({ useVisibilityToggle: (): unknown => state }));

describe('VisibilityToggle behaviors', () => {
  it('should offer hiding a visible selection and toggle on click', () => {
    // mock
    state.hidden = false;

    // before
    render(
      <TooltipProvider>
        <VisibilityToggle />
      </TooltipProvider>,
    );

    // find
    const button = screen.getByRole('button');

    // action
    fireEvent.click(button);

    // result
    expect(button.getAttribute('aria-label')).toBe('Hide');
    expect(state.onToggle).toHaveBeenCalledTimes(1);
  });

  it('should offer showing a hidden selection', () => {
    // mock
    state.hidden = true;

    // before
    render(
      <TooltipProvider>
        <VisibilityToggle />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Show');
  });
});
