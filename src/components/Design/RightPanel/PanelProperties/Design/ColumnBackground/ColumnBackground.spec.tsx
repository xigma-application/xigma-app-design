import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnBackground from './ColumnBackground';
import { TooltipProvider } from 'shared';

// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setPaint } from 'store/design/slice';
import { store } from 'store';

const renderColumnBackground = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnBackground />
      </TooltipProvider>
    </Provider>,
  );

const readPaint = (): typeof DEFAULT_PAINT => store.getState().design.pages[store.getState().design.activePageId].paint;

describe('ColumnBackground snapshots', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_PAINT));
  });

  it('should render the colour field, alpha field, and visibility toggle', () => {
    // before
    const { asFragment } = renderColumnBackground();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnBackground behaviors', () => {
  beforeEach(() => {
    store.dispatch(setPaint(DEFAULT_PAINT));
  });

  it('should seed the hex field from the current page paint', () => {
    // before
    renderColumnBackground();

    // result
    expect(screen.getByDisplayValue('444444')).toBeInTheDocument();
  });

  it('should hide the background when the eye toggle is pressed', () => {
    // before
    renderColumnBackground();

    // action
    fireEvent.click(screen.getByLabelText('Toggle background visibility'));

    // result
    expect(readPaint().visible).toBe(false);
  });

  it('should show the closed-eye icon while the background is hidden', () => {
    // mock
    store.dispatch(setPaint({ ...DEFAULT_PAINT, visible: false }));

    // before
    const { container } = renderColumnBackground();

    // result
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(readPaint().visible).toBe(false);
  });
});
