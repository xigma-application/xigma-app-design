import { fireEvent, render, screen } from '@testing-library/react';

// components
import PanelHeaderBooleanButton from './PanelHeaderBooleanButton';
import { TooltipProvider } from 'shared';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PanelHeaderBooleanButton />
    </TooltipProvider>,
  );

describe('PanelHeaderBooleanButton snapshots', () => {
  it('should render the boolean operations split button', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderBooleanButton behaviors', () => {
  it('should expose the boolean operations label', () => {
    // before
    renderButton();

    // result
    expect(screen.getByLabelText('Boolean operations')).toBeInTheDocument();
  });

  it('should list every boolean operation with its shortcut when the menu opens', () => {
    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Boolean operations options'));

    // result
    expect(screen.getByText('Union')).toBeInTheDocument();
    expect(screen.getByText('Subtract')).toBeInTheDocument();
    expect(screen.getByText('Intersect')).toBeInTheDocument();
    expect(screen.getByText('Exclude')).toBeInTheDocument();
    expect(screen.getByText('Flatten')).toBeInTheDocument();
  });
});
