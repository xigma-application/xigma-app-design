import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnClipContent from './ColumnClipContent';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderColumnClipContent = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <ColumnClipContent />
    </Provider>,
  );

const addFrameNode = (clipContent: boolean): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent,
      fill: '#ff0000',
      height: 20,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 20,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ColumnClipContent snapshots', () => {
  it('should render the checkbox', () => {
    // mock
    const frameId = addFrameNode(true);

    store.dispatch(setSelection([frameId]));

    // before
    const { asFragment } = renderColumnClipContent();

    // result
    expect(asFragment()).toMatchSnapshot();

    // cleanup
    store.dispatch(setSelection([]));
  });
});

describe('ColumnClipContent behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the label', () => {
    // mock
    const frameId = addFrameNode(true);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnClipContent();

    // result
    expect(screen.getByText('Clip content')).toBeInTheDocument();
  });

  it('should reflect the current clipContent value', () => {
    // mock
    const frameId = addFrameNode(true);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnClipContent();

    // result
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should toggle the frame clipContent when clicked', () => {
    // mock
    const frameId = addFrameNode(false);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnClipContent();

    // action
    fireEvent.click(screen.getByRole('checkbox'));

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ clipContent: true });
  });
});
