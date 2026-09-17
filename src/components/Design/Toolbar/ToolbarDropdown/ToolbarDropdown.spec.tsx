import { render, screen } from '@testing-library/react';

// components
import ToolbarDropdown from './ToolbarDropdown';
import { TooltipProvider } from 'shared';

describe('ToolbarDropdown', () => {
  it('should render the placeholder when option is null', () => {
    // before
    render(
      <TooltipProvider>
        <ToolbarDropdown option={null} placeholderLabel="More" triggerAriaLabel="More">
          <div>Menu content</div>
        </ToolbarDropdown>
      </TooltipProvider>,
    );

    // result
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('should render the option when one is given, instead of the placeholder', () => {
    // before
    render(
      <TooltipProvider>
        <ToolbarDropdown
          option={{ icon: 'ShapeBuilderTool', isActive: false, label: 'Shape builder' }}
          placeholderLabel="More"
          triggerAriaLabel="More"
        >
          <div>Menu content</div>
        </ToolbarDropdown>
      </TooltipProvider>,
    );

    // result
    expect(screen.queryByText('More')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shape builder' })).toBeInTheDocument();
  });
});
