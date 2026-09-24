import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderComponentSplitButton from './PanelHeaderComponentSplitButton';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderComponentSplitButton />
      </TooltipProvider>
    </Provider>,
  );

describe('PanelHeaderComponentSplitButton snapshots', () => {
  it('should render the component split button', () => {
    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderComponentSplitButton behaviors', () => {
  it('should list the component actions when the options open', () => {
    // before
    renderButton();

    // action
    fireEvent.click(screen.getByLabelText('Component options'));

    // result
    expect(screen.getByText('Create component')).toBeInTheDocument();
    expect(screen.getByText('Create multiple components')).toBeInTheDocument();
    expect(screen.getByText('Create component set')).toBeInTheDocument();
  });
});
