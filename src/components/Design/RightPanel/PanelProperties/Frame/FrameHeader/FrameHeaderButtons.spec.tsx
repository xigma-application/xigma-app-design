import { fireEvent, render, screen } from '@testing-library/react';

// components
import FrameHeaderButtons from './FrameHeaderButtons';
import { TooltipProvider } from 'shared';

const renderFrameHeaderButtons = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <FrameHeaderButtons />
    </TooltipProvider>,
  );

describe('FrameHeaderButtons snapshots', () => {
  it('should render the html tag, component, and mask buttons', () => {
    // before
    const { asFragment } = renderFrameHeaderButtons();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FrameHeaderButtons behaviors', () => {
  it('should do nothing yet when the html tag button is clicked', () => {
    // before
    renderFrameHeaderButtons();
    const button = screen.getByLabelText('Toggle ready for dev status');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });

  it('should do nothing yet when the component button is clicked', () => {
    // before
    renderFrameHeaderButtons();
    const button = screen.getByLabelText('Create component');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });

  it('should do nothing yet when the mask button is clicked', () => {
    // before
    renderFrameHeaderButtons();
    const button = screen.getByLabelText('Use as mask');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });
});
