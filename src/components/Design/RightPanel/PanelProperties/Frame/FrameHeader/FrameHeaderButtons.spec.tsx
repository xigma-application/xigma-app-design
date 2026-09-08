import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import FrameHeaderButtons from './FrameHeaderButtons';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderFrameHeaderButtons = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <FrameHeaderButtons />
      </TooltipProvider>
    </Provider>,
  );

describe('FrameHeaderButtons snapshots', () => {
  it('should render the html tag and component buttons', () => {
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

  it('should not render a mask button — frames cannot be used as masks', () => {
    // before
    renderFrameHeaderButtons();

    // result
    expect(screen.queryByLabelText('Use as mask')).not.toBeInTheDocument();
  });
});
