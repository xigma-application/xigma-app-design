import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import Toolbar from './Toolbar';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import { TooltipProvider } from 'shared';

// others
import { ZOOM_HINT_FIT_LABEL_KEY } from './DesignHint/constants';

// store
import { setActionsPanelOpen, setActiveTool, setDesignHintLabelKey, setMediaToolArmed, toggleUiHidden } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderToolbar = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <TooltipProvider>
          <Toolbar />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Toolbar snapshots', () => {
  it('should render Toolbar', () => {
    // before
    const { asFragment } = renderToolbar();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Toolbar behaviors', () => {
  beforeEach(() => {
    store.dispatch(setActionsPanelOpen(false));
  });

  it('should open the Actions panel on click and dispatch isActionsPanelOpen', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderToolbar();
    expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();

    // action
    await user.click(screen.getByRole('button', { name: 'Actions' }));

    // result
    expect(store.getState().design.isActionsPanelOpen).toBe(true);
    expect(await screen.findByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should render the panel already open when isActionsPanelOpen is true, e.g. after the Cmd+K shortcut', () => {
    // mock
    store.dispatch(setActionsPanelOpen(true));

    // before
    renderToolbar();

    // result
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should close the panel and clear isActionsPanelOpen when the trigger is clicked again while open', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(setActionsPanelOpen(true));

    // before
    renderToolbar();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();

    // action
    await user.click(screen.getByRole('button', { name: 'Actions' }));

    // result
    expect(store.getState().design.isActionsPanelOpen).toBe(false);
  });

  it('should not render the media tool hint when the media tool is inactive', () => {
    // before
    renderToolbar();

    // result
    expect(screen.queryByText('Click or drag to place')).not.toBeInTheDocument();
  });

  it('should not render the media tool hint while the media tool is active but nothing has been picked yet', () => {
    // action
    store.dispatch(setActiveTool(ToolName.media));

    // before
    renderToolbar();

    // result
    expect(screen.queryByText('Click or drag to place')).not.toBeInTheDocument();

    // cleanup
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should render the media tool hint once the user has picked media from the system', () => {
    // action
    store.dispatch(setActiveTool(ToolName.media));
    store.dispatch(setMediaToolArmed(true));

    // before
    renderToolbar();

    // result
    expect(screen.getByText('Click or drag to place')).toBeInTheDocument();
    expect(screen.getByText('Place all')).toBeInTheDocument();

    // cleanup
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setMediaToolArmed(false));
  });

  it('should not render the design hint when there is no hint to show', () => {
    // before
    renderToolbar();

    // result
    expect(screen.queryByText('Zoomed to fit')).not.toBeInTheDocument();
  });

  it('should render the design hint once a hint label key is set, e.g. after Zoom to fit', () => {
    // action
    store.dispatch(setDesignHintLabelKey(ZOOM_HINT_FIT_LABEL_KEY));

    // before
    renderToolbar();

    // result
    expect(screen.getByText('Zoomed to fit')).toBeInTheDocument();

    // cleanup
    store.dispatch(setDesignHintLabelKey(null));
  });

  it('should render nothing when the UI is hidden', () => {
    // mock
    store.dispatch(toggleUiHidden());

    // before
    const { container } = renderToolbar();

    // result
    expect(container.firstChild).toBeNull();

    // cleanup
    store.dispatch(toggleUiHidden());
  });
});
