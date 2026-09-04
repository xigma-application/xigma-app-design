import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelProperties from './PanelProperties';
import { TooltipProvider } from 'shared';

// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';

const renderPanelProperties = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelProperties />
      </TooltipProvider>
    </Provider>,
  );

describe('PanelProperties behaviors', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the Design, Styles, Export, and MCP sections while nothing is selected', () => {
    // before
    renderPanelProperties();

    // result
    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText('Styles')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('MCP')).toBeInTheDocument();
  });

  it('should render nothing while a node is selected', () => {
    // mock
    store.dispatch(setSelection(['node-1']));

    // before
    const { container } = renderPanelProperties();

    // result
    expect(container).toBeEmptyDOMElement();

    // cleanup
    store.dispatch(setSelection([]));
  });
});
