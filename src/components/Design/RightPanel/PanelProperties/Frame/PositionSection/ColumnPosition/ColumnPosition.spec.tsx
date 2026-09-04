import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnPosition from './ColumnPosition';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderColumnPosition = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnPosition />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (x: number, y: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ColumnPosition snapshots', () => {
  it('should render the X and Y fields', () => {
    // mock
    const frameId = addFrameNode(-1010, -810);

    store.dispatch(setSelection([frameId]));

    // before
    const { asFragment } = renderColumnPosition();

    // result
    expect(asFragment()).toMatchSnapshot();

    // cleanup
    store.dispatch(setSelection([]));
  });
});

describe('ColumnPosition behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the row label', () => {
    // mock
    const frameId = addFrameNode(-1010, -810);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnPosition();

    // result
    expect(screen.getByText('Position')).toBeInTheDocument();
  });

  it('should show the current x and y values', () => {
    // mock
    const frameId = addFrameNode(-1010, -810);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnPosition();

    // result
    expect(screen.getByLabelText('X position')).toHaveValue(-1010);
    expect(screen.getByLabelText('Y position')).toHaveValue(-810);
  });

  it('should update the frame x when the X field is committed', () => {
    // mock
    const frameId = addFrameNode(-1010, -810);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnPosition();
    const input = screen.getByLabelText('X position');

    // action
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.blur(input);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ x: 42 });
  });
});
