import { render, screen } from '@testing-library/react';

// components
import SectionHeaderButtons from './SectionHeaderButtons';
import { TooltipProvider } from 'shared';

describe('SectionHeaderButtons behaviors', () => {
  it('should render the dev status button', () => {
    // before
    render(
      <TooltipProvider>
        <SectionHeaderButtons />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByLabelText('Toggle ready for dev status')).toBeInTheDocument();
  });
});
