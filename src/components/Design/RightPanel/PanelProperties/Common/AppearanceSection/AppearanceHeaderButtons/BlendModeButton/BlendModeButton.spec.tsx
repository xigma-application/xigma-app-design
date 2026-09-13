import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import BlendModeButton from './BlendModeButton';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderBlendModeButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <BlendModeButton />
      </TooltipProvider>
    </Provider>,
  );

describe('BlendModeButton snapshots', () => {
  it('should render the trigger with the menu closed', () => {
    // before
    const { asFragment } = renderBlendModeButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('BlendModeButton behaviors', () => {
  it('should open the blend mode menu when the trigger is clicked', () => {
    // before
    renderBlendModeButton();

    // action
    fireEvent.click(screen.getByLabelText('Apply blend mode'));

    // result
    expect(screen.getByText('Pass through')).toBeInTheDocument();
    expect(screen.getByText('Luminosity')).toBeInTheDocument();
  });
});
