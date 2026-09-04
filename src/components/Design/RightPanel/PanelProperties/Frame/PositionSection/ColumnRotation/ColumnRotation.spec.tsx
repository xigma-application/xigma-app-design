import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnRotation from './ColumnRotation';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderColumnRotation = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnRotation />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (rotation: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ColumnRotation snapshots', () => {
  it('should render the rotation field and the rotate/flip buttons', () => {
    // mock
    const frameId = addFrameNode(20);

    store.dispatch(setSelection([frameId]));

    // before
    const { asFragment } = renderColumnRotation();

    // result
    expect(asFragment()).toMatchSnapshot();

    // cleanup
    store.dispatch(setSelection([]));
  });
});

describe('ColumnRotation behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the row label', () => {
    // mock
    const frameId = addFrameNode(20);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnRotation();

    // result
    expect(screen.getByText('Rotation')).toBeInTheDocument();
  });

  it('should show the current rotation value', () => {
    // mock
    const frameId = addFrameNode(20);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnRotation();

    // result
    expect(screen.getByLabelText('Rotation')).toHaveValue('20°');
  });

  it('should update the frame rotation when the rotation field is committed', () => {
    // mock
    const frameId = addFrameNode(20);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnRotation();
    const input = screen.getByLabelText('Rotation');

    // action
    fireEvent.change(input, { target: { value: '75°' } });
    fireEvent.blur(input);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ rotation: 75 });
  });

  it('should rotate the frame 90° clockwise when the rotate button is clicked', () => {
    // mock
    const frameId = addFrameNode(20);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnRotation();

    // action
    fireEvent.click(screen.getByLabelText('Rotate 90° right'));

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ rotation: 110 });
  });
});
