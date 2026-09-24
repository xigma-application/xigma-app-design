import { fireEvent, render, screen } from '@testing-library/react';

// components
import PanelHeaderMaskButton from './PanelHeaderMaskButton';
import { TooltipProvider } from 'shared';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PanelHeaderMaskButton />
    </TooltipProvider>,
  );

describe('PanelHeaderMaskButton snapshots', () => {
  it('should render the use as mask button', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderMaskButton behaviors', () => {
  it('should expose the use as mask label', () => {
    // before
    renderButton();

    // result
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
  });

  it('should do nothing yet when clicked', () => {
    // before
    renderButton();
    const button = screen.getByLabelText('Use as mask');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });
});
