import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelHeaderMatchingLayersButton from './PanelHeaderMatchingLayersButton';
import { TooltipProvider } from 'shared';

// store
import { addNodes, setSelection } from 'store/design/slice';
import { selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// utils
import { matchingNodes, matchingRootOrder } from 'store/design/utils/matchingLayers/test/matchingLayersFixtures';

const renderButton = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelHeaderMatchingLayersButton />
      </TooltipProvider>
    </Provider>,
  );

beforeAll(() => {
  store.dispatch(addNodes({ nodes: matchingNodes, rootIds: matchingRootOrder }));
});

describe('PanelHeaderMatchingLayersButton snapshots', () => {
  it('should render the select matching layers button for a nested selection', () => {
    // mock
    store.dispatch(setSelection(['titleA']));

    // before
    const { asFragment } = renderButton();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelHeaderMatchingLayersButton behaviors', () => {
  it('should render nothing for a top-level selection', () => {
    // mock
    store.dispatch(setSelection(['screenA']));

    // before
    renderButton();

    // result
    expect(screen.queryByLabelText('Select matching layers')).not.toBeInTheDocument();
  });

  it('should select the matching layers when clicked', () => {
    // mock
    store.dispatch(setSelection(['titleA']));

    // before
    renderButton();

    // action
    act(() => {
      fireEvent.click(screen.getByLabelText('Select matching layers'));
    });

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['titleA', 'titleB']);
  });
});
