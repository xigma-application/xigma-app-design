import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import PanelContent from './PanelContent';
import { TooltipProvider } from 'shared';

// store
import { store } from 'store';

// types
import { NavItemName } from '../NavRail/types';

const renderPanelContent = (activeNavItem: NavItemName): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <PanelContent activeNavItem={activeNavItem} name="Untitled" onRenameFile={vi.fn()} />
      </TooltipProvider>
    </Provider>,
  );

describe('PanelContent snapshots', () => {
  it('should render the File panel for the file nav item', () => {
    // before
    const { asFragment } = renderPanelContent(NavItemName.file);

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render nothing for the other nav items', () => {
    // before
    const { asFragment } = renderPanelContent(NavItemName.agents);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('PanelContent behaviors', () => {
  it('should show the File panel when the file nav item is active', () => {
    // before
    renderPanelContent(NavItemName.file);

    // result
    expect(screen.getByRole('button', { name: 'Rename file' })).toBeInTheDocument();
  });

  it('should not show the File panel for a non-file nav item', () => {
    // before
    renderPanelContent(NavItemName.tools);

    // result
    expect(screen.queryByRole('button', { name: 'Rename file' })).not.toBeInTheDocument();
  });
});
