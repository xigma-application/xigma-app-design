import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnDimensions from './ColumnDimensions';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

const renderColumnDimensions = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnDimensions />
      </TooltipProvider>
    </Provider>,
  );

const addFrameNode = (width: number, height: number, lockedAspectRatio = false): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height,
      lockedAspectRatio,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addAutoLayoutFrameNode = (width: number, height: number): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height,
      layoutMode: LayoutMode.horizontal,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width,
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ColumnDimensions snapshots', () => {
  it('should render the width and height fields and the lock button', () => {
    // mock
    const frameId = addFrameNode(326, 187);

    store.dispatch(setSelection([frameId]));

    // before
    const { asFragment } = renderColumnDimensions();

    // result
    expect(asFragment()).toMatchSnapshot();

    // cleanup
    store.dispatch(setSelection([]));
  });
});

describe('ColumnDimensions behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render the row label', () => {
    // mock
    const frameId = addFrameNode(326, 187);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnDimensions();

    // result
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
  });

  it('should show the current width and height values', () => {
    // mock
    const frameId = addFrameNode(326, 187);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnDimensions();

    // result
    expect(screen.getByLabelText('Width')).toHaveValue(326);
    expect(screen.getByLabelText('Height')).toHaveValue(187);
  });

  it('should update the frame width when the width field is committed', () => {
    // mock
    const frameId = addFrameNode(326, 187);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnDimensions();
    const input = screen.getByLabelText('Width');

    // action
    fireEvent.change(input, { target: { value: '400' } });
    fireEvent.blur(input);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ height: 187, width: 400 });
  });

  it('should scale the height when the width field is committed and the lock is on', () => {
    // mock
    const frameId = addFrameNode(200, 100, true);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnDimensions();
    const input = screen.getByLabelText('Width');

    // action
    fireEvent.change(input, { target: { value: '400' } });
    fireEvent.blur(input);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ height: 200, width: 400 });
  });

  it('should toggle the lock when the lock button is clicked', () => {
    // mock
    const frameId = addFrameNode(326, 187);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnDimensions();

    // action
    fireEvent.click(screen.getByLabelText('Lock aspect ratio'));

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ lockedAspectRatio: true });
  });

  it('should show the input connector between the width and height fields when locked', () => {
    // mock
    const frameId = addFrameNode(326, 187, true);

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderColumnDimensions();

    // result
    expect(container.querySelector('[class*="SectionColumnContent__input-connector"]')).not.toBeNull();
  });

  it('should not show the input connector when unlocked', () => {
    // mock
    const frameId = addFrameNode(326, 187, false);

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderColumnDimensions();

    // result
    expect(container.querySelector('[class*="SectionColumnContent__input-connector"]')).toBeNull();
  });

  it('should not show the sizing-mode chevrons for a plain (non-auto-layout) frame', () => {
    // mock
    const frameId = addFrameNode(326, 187);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnDimensions();

    // result
    expect(screen.queryByLabelText('Width sizing options')).toBeNull();
    expect(screen.queryByLabelText('Height sizing options')).toBeNull();
  });

  it('should show both sizing-mode chevrons for an auto-layout frame', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(326, 187);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnDimensions();

    // result
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
    expect(screen.getByLabelText('Height sizing options')).toBeInTheDocument();
  });

  it('should switch the width sizing mode to hug when the width menu’s Hug option is clicked', () => {
    // mock
    const frameId = addAutoLayoutFrameNode(326, 187);

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnDimensions();

    // action
    fireEvent.click(screen.getByLabelText('Width sizing options'));
    fireEvent.click(screen.getByText('Hug contents'));

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ widthSizingMode: 'hug' });
  });
});
