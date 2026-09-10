import { fireEvent, render, screen } from '@testing-library/react';

// components
import PanelHeaderComponentButton from './PanelHeaderComponentButton';
import { TooltipProvider } from 'shared';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PanelHeaderComponentButton />
    </TooltipProvider>,
  );

describe('PanelHeaderComponentButton snapshots', () => {
  it('should render the create component button', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderComponentButton behaviors', () => {
  it('should expose the create component label', () => {
    // before
    renderButton();

    // result
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
  });

  it('should do nothing yet when clicked', () => {
    // before
    renderButton();
    const button = screen.getByLabelText('Create component');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });
});
