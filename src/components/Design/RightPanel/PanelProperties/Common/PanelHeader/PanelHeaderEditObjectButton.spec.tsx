import { fireEvent, render, screen } from '@testing-library/react';

// components
import PanelHeaderEditObjectButton from './PanelHeaderEditObjectButton';
import { TooltipProvider } from 'shared';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PanelHeaderEditObjectButton />
    </TooltipProvider>,
  );

describe('PanelHeaderEditObjectButton snapshots', () => {
  it('should render the edit object button', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderEditObjectButton behaviors', () => {
  it('should expose the edit object label', () => {
    // before
    renderButton();

    // result
    expect(screen.getByLabelText('Edit object')).toBeInTheDocument();
  });

  it('should do nothing yet when clicked', () => {
    // before
    renderButton();
    const button = screen.getByLabelText('Edit object');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });
});
