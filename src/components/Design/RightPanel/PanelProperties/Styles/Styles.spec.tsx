import { fireEvent, render, screen } from '@testing-library/react';

// components
import Styles from './Styles';
import { TooltipProvider } from 'shared';

const renderStyles = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Styles />
    </TooltipProvider>,
  );

describe('Styles snapshots', () => {
  it('should render the Styles section with its add button', () => {
    // before
    const { asFragment } = renderStyles();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Styles behaviors', () => {
  it('should label the section "Styles"', () => {
    // before
    renderStyles();

    // result
    expect(screen.getByText('Styles')).toBeInTheDocument();
  });

  it('should expose an accessible add button that does nothing yet', () => {
    // before
    renderStyles();
    const addButton = screen.getByLabelText('Add style');

    // result
    expect(addButton).toBeInTheDocument();

    // action — the add flow isn't built yet, clicking it is a deliberate no-op
    fireEvent.click(addButton);
  });
});
