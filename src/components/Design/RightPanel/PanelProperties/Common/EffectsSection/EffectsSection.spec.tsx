import { fireEvent, render, screen } from '@testing-library/react';

// components
import EffectsSection from './EffectsSection';
import { TooltipProvider } from 'shared';

const renderSection = (): void => {
  render(
    <TooltipProvider>
      <EffectsSection />
    </TooltipProvider>,
  );
};

describe('EffectsSection', () => {
  it('should render the Effects label with an add button and no rows', () => {
    // Step 1: Render the section
    renderSection();

    // Step 2: Assert the label and the add button are shown
    expect(screen.getByText('Effects')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add effect' })).toBeTruthy();
  });

  it('should open a menu with every effect type when the add button is clicked', () => {
    // Step 1: Render the section
    renderSection();

    // Step 2: Open the menu
    fireEvent.click(screen.getByRole('button', { name: 'Add effect' }));

    // Step 3: Assert every option is listed, without a Beta badge
    ['Inner shadow', 'Drop shadow', 'Layer blur', 'Background blur', 'Noise', 'Texture', 'Glass', 'Shader'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
    expect(screen.queryByText('Beta')).toBeNull();
  });
});
