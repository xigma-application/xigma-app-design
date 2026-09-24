import { render, screen } from '@testing-library/react';

// components
import PopoverAutoLayoutSettingsLayoutControl from './PopoverAutoLayoutSettingsLayoutControl';
import { TooltipProvider } from 'shared';

// types
import { LayoutVersion } from 'types/design/enums';

describe('PopoverAutoLayoutSettingsLayoutControl behaviors', () => {
  it('should render the info icon and the dropdown with the selected option', () => {
    // before
    render(
      <TooltipProvider>
        <PopoverAutoLayoutSettingsLayoutControl
          onHoverOption={vi.fn()}
          onSelect={vi.fn()}
          options={[
            { label: 'Stack', value: LayoutVersion.updated },
            { label: 'Legacy', value: LayoutVersion.legacy },
          ]}
          value={LayoutVersion.updated}
        />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByText('Stack')).toBeInTheDocument();
  });

  it('should hand the className to its root', () => {
    // before
    const { container } = render(
      <TooltipProvider>
        <PopoverAutoLayoutSettingsLayoutControl
          className="custom"
          onHoverOption={vi.fn()}
          onSelect={vi.fn()}
          options={[{ label: 'Stack', value: LayoutVersion.updated }]}
          value={LayoutVersion.updated}
        />
      </TooltipProvider>,
    );

    // result
    expect(container.querySelector('.custom')).not.toBeNull();
  });
});
