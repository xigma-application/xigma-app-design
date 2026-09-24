import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderWrapInSectionButton from './PanelHeaderWrapInSectionButton';
import { TooltipProvider } from 'shared';

// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderWrapInSectionButton />
      </TooltipProvider>
    </Provider>,
  );

afterEach(() => {
  store.dispatch(setSelection([]));
});

describe('PanelHeaderWrapInSectionButton snapshots', () => {
  it('should render the wrap in section button for a multi-selection', () => {
    // mock
    store.dispatch(setSelection(['first', 'second']));

    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderWrapInSectionButton behaviors', () => {
  it('should render nothing for a single selection', () => {
    // mock
    store.dispatch(setSelection(['first']));

    // before
    renderButton();

    // result
    expect(screen.queryByLabelText('Wrap in new section')).not.toBeInTheDocument();
  });
});
