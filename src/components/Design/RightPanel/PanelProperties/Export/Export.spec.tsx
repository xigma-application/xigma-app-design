import { fireEvent, render, screen } from '@testing-library/react';

// components
import Export from './Export';
import { TooltipProvider } from 'shared';

const renderExport = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Export />
    </TooltipProvider>,
  );

describe('Export snapshots', () => {
  it('should render the Export section with its add button', () => {
    // before
    const { asFragment } = renderExport();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Export behaviors', () => {
  it('should label the section "Export"', () => {
    // before
    renderExport();

    // result
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should expose an accessible add button that does nothing yet', () => {
    // before
    renderExport();
    const addButton = screen.getByLabelText('Add export setting');

    // result
    expect(addButton).toBeInTheDocument();

    // action — the add flow isn't built yet, clicking it is a deliberate no-op
    fireEvent.click(addButton);
  });
});
