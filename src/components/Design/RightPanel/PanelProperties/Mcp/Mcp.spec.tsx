import { fireEvent, render, screen } from '@testing-library/react';

// components
import Mcp from './Mcp';
import { TooltipProvider } from 'shared';

const renderMcp = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Mcp />
    </TooltipProvider>,
  );

describe('Mcp snapshots', () => {
  it('should render the MCP section with its "No connections" chip and add button', () => {
    // before
    const { asFragment } = renderMcp();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Mcp behaviors', () => {
  it('should label the section "MCP"', () => {
    // before
    renderMcp();

    // result
    expect(screen.getByText('MCP')).toBeInTheDocument();
  });

  it('should show a "No connections" chip next to the label', () => {
    // before
    renderMcp();

    // result
    expect(screen.getByText('No connections')).toBeInTheDocument();
  });

  it('should expose an accessible add button that does nothing yet', () => {
    // before
    renderMcp();
    const addButton = screen.getByLabelText('Add MCP connection');

    // result
    expect(addButton).toBeInTheDocument();

    // action — the add flow isn't built yet, clicking it is a deliberate no-op
    fireEvent.click(addButton);
  });
});
