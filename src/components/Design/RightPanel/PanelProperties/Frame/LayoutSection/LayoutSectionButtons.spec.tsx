import { fireEvent, render, screen } from '@testing-library/react';

// components
import LayoutSectionButtons from './LayoutSectionButtons';
import { TooltipProvider } from 'shared';

const renderLayoutSectionButtons = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <LayoutSectionButtons />
    </TooltipProvider>,
  );

describe('LayoutSectionButtons snapshots', () => {
  it('should render the resize-to-fit and auto-layout buttons', () => {
    // before
    const { asFragment } = renderLayoutSectionButtons();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('LayoutSectionButtons behaviors', () => {
  it('should do nothing yet when the resize-to-fit button is clicked', () => {
    // before
    renderLayoutSectionButtons();
    const button = screen.getByLabelText('Resize to fit');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });

  it('should do nothing yet when the auto-layout button is clicked', () => {
    // before
    renderLayoutSectionButtons();
    const button = screen.getByLabelText('Use auto layout');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });
});
