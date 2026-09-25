import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnBackground from './ColumnBackground';
import { TooltipProvider } from 'shared';

// store
import { selectBackgroundPaint } from 'store/design/selectors';
import { DEFAULT_PAINT } from 'store/design/constants';
import { setBackgroundPaint } from 'store/design/slice';
import { store } from 'store';

const renderColumnBackground = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnBackground />
      </TooltipProvider>
    </Provider>,
  );

const readPaint = (): typeof DEFAULT_PAINT => selectBackgroundPaint(store.getState());

describe('ColumnBackground snapshots', () => {
  beforeEach(() => {
    store.dispatch(setBackgroundPaint(DEFAULT_PAINT));
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
    store.dispatch(setBackgroundPaint(DEFAULT_PAINT));
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
    store.dispatch(setBackgroundPaint({ ...DEFAULT_PAINT, visible: false }));

    // before
    const { container } = renderColumnBackground();

    // result
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(readPaint().visible).toBe(false);
  });

  it('should show a plain "Custom" title in the color picker header, without Solid/Gradient tabs', () => {
    // before
    renderColumnBackground();

    // action
    fireEvent.click(screen.getByLabelText('Background color'));

    // result
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.queryByText('Solid')).not.toBeInTheDocument();
    expect(screen.queryByText('Gradient')).not.toBeInTheDocument();
  });
});
