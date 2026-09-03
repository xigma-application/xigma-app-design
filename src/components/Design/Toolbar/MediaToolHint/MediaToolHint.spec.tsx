import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';

// components
import MediaToolHint from './MediaToolHint';

// core
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';

// store
import { selectActiveTool } from 'store/design/selectors';
import { setActiveTool, setMediaToolArmed } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderMediaToolHint = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>
        <MediaToolHint />
      </CanvasRefsProvider>
    </Provider>,
  );

describe('MediaToolHint behaviors', () => {
  afterEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setMediaToolArmed(false));
  });

  it('should render nothing when the media tool is not active', () => {
    // before
    renderMediaToolHint();

    // result
    expect(screen.queryByText('Click or drag to place')).not.toBeInTheDocument();
  });

  it('should render nothing while the media tool is active but nothing has been picked yet', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.media));

    // before
    renderMediaToolHint();

    // result
    expect(screen.queryByText('Click or drag to place')).not.toBeInTheDocument();
  });

  it('should render the hint bar once the user has picked media from the system', () => {
    // mock
    store.dispatch(setActiveTool(ToolName.media));
    store.dispatch(setMediaToolArmed(true));

    // before
    renderMediaToolHint();

    // result
    expect(screen.getByText('Click or drag to place')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Place all' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should revert to the default tool when the close button is clicked', async () => {
    // mock
    const user = userEvent.setup();
    store.dispatch(setActiveTool(ToolName.media));
    store.dispatch(setMediaToolArmed(true));

    // before
    renderMediaToolHint();

    // action
    await user.click(screen.getByRole('button', { name: 'Close' }));

    // result
    expect(selectActiveTool(store.getState())).toBe(ToolName.default);
  });
});
