import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import ToolbarDropdownOption from './ToolbarDropdownOption';
import { TooltipProvider } from 'shared';

const renderToolbarDropdownOption = (isActive: boolean, isDisabled?: boolean, onClick?: TFunc): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ToolbarDropdownOption
        icon="ShapeBuilderTool"
        isActive={isActive}
        isDisabled={isDisabled}
        label="Shape builder"
        onClick={onClick}
        triggerAriaLabel="More"
      >
        <div>Menu content</div>
      </ToolbarDropdownOption>
    </TooltipProvider>,
  );

describe('ToolbarDropdownOption', () => {
  it('should render the option as inactive when isActive is false', () => {
    // before
    renderToolbarDropdownOption(false);

    // result
    expect(screen.getByRole('button', { name: 'Shape builder' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render the option as active when isActive is true', () => {
    // before
    renderToolbarDropdownOption(true);

    // result
    expect(screen.getByRole('button', { name: 'Shape builder' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onClick when the option button is clicked', () => {
    // mock
    const handleClick = vi.fn();

    // before
    renderToolbarDropdownOption(false, false, handleClick);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Shape builder' }));

    // result
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should disable the option button when isDisabled is true', () => {
    // before
    renderToolbarDropdownOption(false, true);

    // result
    expect(screen.getByRole('button', { name: 'Shape builder' })).toBeDisabled();
  });

  it('should show its children from the small chevron trigger', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderToolbarDropdownOption(false);

    // action
    await user.click(screen.getByRole('button', { name: 'More' }));

    // result
    expect(screen.getByText('Menu content')).toBeInTheDocument();
  });
});
