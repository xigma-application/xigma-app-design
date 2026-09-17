import { fireEvent, render, screen } from '@testing-library/react';

// components
import ToolbarButton from './ToolbarButton';
import { TooltipProvider } from 'shared';

const renderToolbarButton = (isActive: boolean, onClick?: TFunc): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ToolbarButton icon="MoveVectorTool" isActive={isActive} label="Move" onClick={onClick} shortcut="V" tooltip="Move" />
    </TooltipProvider>,
  );

describe('ToolbarButton', () => {
  it('should render the label and reflect the isActive prop', () => {
    // before
    renderToolbarButton(true);

    // result
    expect(screen.getByText('Move')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onClick when clicked', () => {
    // mock
    const handleClick = vi.fn();

    // before
    renderToolbarButton(false, handleClick);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with no onClick as inert — never throws on click', () => {
    // before
    renderToolbarButton(false);

    // result
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-pressed', 'false');

    // action — clicking with no onClick must not throw
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it('should render with no visible label when none is given, using tooltip as the accessible name', () => {
    // before
    render(
      <TooltipProvider>
        <ToolbarButton icon="Close" isActive={false} tooltip="Close" />
      </TooltipProvider>,
    );

    // result
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
