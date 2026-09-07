import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnMinMaxDimensions from './ColumnMinMaxDimensions';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const renderColumnMinMaxDimensions = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <ColumnMinMaxDimensions />
    </Provider>,
  );

const addFrameNode = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 50,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
      ...overrides,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('ColumnMinMaxDimensions', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render nothing when the selected frame has no bounds set', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderColumnMinMaxDimensions();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when nothing is selected', () => {
    // before
    const { container } = renderColumnMinMaxDimensions();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render only the width field within the Min row when only minWidth is set', () => {
    // mock
    const frameId = addFrameNode({ minWidth: 20 });

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnMinMaxDimensions();

    // result
    expect(screen.getByLabelText('Min width')).toHaveValue(20);
    expect(screen.queryByLabelText('Min height')).toBeNull();
    expect(screen.getByText('Min')).toBeInTheDocument();
  });

  it('should render only the height field within the Min row when only minHeight is set', () => {
    // mock
    const frameId = addFrameNode({ minHeight: 15 });

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnMinMaxDimensions();

    // result
    expect(screen.getByLabelText('Min height')).toHaveValue(15);
    expect(screen.queryByLabelText('Min width')).toBeNull();
  });

  it('should render only the height field within the Max row when only maxHeight is set', () => {
    // mock
    const frameId = addFrameNode({ maxHeight: 95 });

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnMinMaxDimensions();

    // result
    expect(screen.getByLabelText('Max height')).toHaveValue(95);
    expect(screen.queryByLabelText('Max width')).toBeNull();
  });

  it('should render all four fields when every bound is set', () => {
    // mock
    const frameId = addFrameNode({ maxHeight: 90, maxWidth: 80, minHeight: 30, minWidth: 20 });

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnMinMaxDimensions();

    // result
    expect(screen.getByLabelText('Min width')).toHaveValue(20);
    expect(screen.getByLabelText('Min height')).toHaveValue(30);
    expect(screen.getByLabelText('Max width')).toHaveValue(80);
    expect(screen.getByLabelText('Max height')).toHaveValue(90);
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
  });

  it('should commit a new minWidth value on blur', () => {
    // mock
    const frameId = addFrameNode({ minWidth: 20 });

    store.dispatch(setSelection([frameId]));

    // before
    renderColumnMinMaxDimensions();
    const input = screen.getByLabelText('Min width');

    // action
    fireEvent.change(input, { target: { value: '55' } });
    fireEvent.blur(input);

    // result
    expect(selectActivePage(store.getState()).nodes[frameId]).toMatchObject({ minWidth: 55 });
  });
});
