import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import NoSelection from './NoSelection';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

const renderNoSelection = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <NoSelection />
      </TooltipProvider>
    </Provider>,
  );

describe('NoSelection snapshots', () => {
  it('should render the Design, Styles, Export, and MCP sections', () => {
    // before
    const { asFragment } = renderNoSelection();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('NoSelection behaviors', () => {
  it('should render every section', () => {
    // before
    renderNoSelection();

    // result
    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText('Styles')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('MCP')).toBeInTheDocument();
  });
});
