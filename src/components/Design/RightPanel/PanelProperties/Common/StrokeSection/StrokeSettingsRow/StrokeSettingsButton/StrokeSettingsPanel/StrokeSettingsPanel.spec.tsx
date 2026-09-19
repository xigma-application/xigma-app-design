import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import StrokeSettingsPanel from './StrokeSettingsPanel';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderPanel = (onClose: TFunc = vi.fn()): ReturnType<typeof render> => {
  store.dispatch(
    addNode({ fills: [], height: 10, name: 'Rectangle', parentId: null, rotation: 0, type: NodeType.rectangle, width: 10, x: 0, y: 0 }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  store.dispatch(setSelection([rootOrder[rootOrder.length - 1]]));

  return render(
    <Provider store={store}>
      <TooltipProvider>
        <StrokeSettingsPanel onClose={onClose} />
      </TooltipProvider>
    </Provider>,
  );
};

describe('StrokeSettingsPanel', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the header, the three tabs and the Basic rows, and close from the header', () => {
    // before
    const onClose = vi.fn();

    // action
    renderPanel(onClose);

    // result
    expect(screen.getByText('Stroke settings')).toBeInTheDocument();
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Dynamic')).toBeInTheDocument();
    expect(screen.getByText('Brush')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Width profile')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
    expect(screen.getByText('Miter angle')).toBeInTheDocument();

    // action
    fireEvent.click(screen.getByLabelText('Close'));

    // result
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should disable the flip profile button while the default Uniform profile is selected', () => {
    // action
    renderPanel();

    // result
    expect(screen.getByLabelText('Flip width profile')).toBeDisabled();
  });

  it('should show the Frequency, Wiggle and Smoothen rows on the Dynamic tab instead of the Basic rows', () => {
    // before
    renderPanel();

    // action
    fireEvent.click(screen.getByText('Dynamic'));

    // result
    expect(screen.getByLabelText('Frequency')).toHaveValue('75%');
    expect(screen.getByLabelText('Wiggle')).toHaveValue('30%');
    expect(screen.getByLabelText('Smoothen')).toHaveValue('50%');
    expect(screen.queryByText('Width profile')).not.toBeInTheDocument();
  });

  it('should hide the Basic rows when the Brush tab is active', () => {
    // before
    renderPanel();

    // action
    fireEvent.click(screen.getByText('Brush'));

    // result
    expect(screen.queryByText('Width profile')).not.toBeInTheDocument();
  });
});
