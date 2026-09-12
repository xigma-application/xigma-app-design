import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import CornerSmoothingButton from './CornerSmoothingButton';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <CornerSmoothingButton />
      </TooltipProvider>
    </Provider>,
  );

describe('CornerSmoothingButton snapshots', () => {
  it('should render the trigger with the popover closed', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('CornerSmoothingButton behaviors', () => {
  it('should open the corner smoothing popover when the trigger is clicked', () => {
    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Corner smoothing'));

    // result
    expect(screen.getByRole('slider', { name: 'Corner smoothing value' })).toBeInTheDocument();
  });

  it('should close the popover when the header close button is clicked', () => {
    // before
    renderButton();
    fireEvent.click(screen.getByLabelText('Corner smoothing'));

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(screen.queryByRole('slider', { name: 'Corner smoothing value' })).not.toBeInTheDocument();
  });
});
