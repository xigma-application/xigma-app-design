import { render, screen } from '@testing-library/react';

// components
import EffectsSection from './EffectsSection';
import { TooltipProvider } from 'shared';

describe('EffectsSection', () => {
  it('should render the Effects label with an add button and no rows', () => {
    // Step 1: Render the section
    render(
      <TooltipProvider>
        <EffectsSection />
      </TooltipProvider>,
    );

    // Step 2: Assert the label and the add button are shown
    expect(screen.getByText('Effects')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add effect' })).toBeTruthy();
  });

  it('should do nothing when the add button is clicked', () => {
    // Step 1: Render the section
    const { container } = render(
      <TooltipProvider>
        <EffectsSection />
      </TooltipProvider>,
    );
    const html = container.innerHTML;

    // Step 2: Click add
    screen.getByRole('button', { name: 'Add effect' }).click();

    // Step 3: Assert nothing changed
    expect(container.innerHTML).toBe(html);
  });
});
