import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnMinMaxDimensions from './ColumnMinMaxDimensions';

// store
import { addNode, setMinMaxRevealed, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';
import { TRevealedMinMax } from 'store/design/types';

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

const reveal = (...bounds: (keyof TRevealedMinMax)[]): void => {
  bounds.forEach((bound) => store.dispatch(setMinMaxRevealed({ bound, value: true })));
};

describe('ColumnMinMaxDimensions', () => {
  beforeEach(() => {
    (['maxHeight', 'maxWidth', 'minHeight', 'minWidth'] as const).forEach((bound) => {
      store.dispatch(setMinMaxRevealed({ bound, value: false }));
    });
  });

  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render nothing when no bound row is revealed, even with values on the node', () => {
    // mock
    const frameId = addFrameNode({ maxWidth: 80, minWidth: 20 });

    store.dispatch(setSelection([frameId]));

    // before
    const { container } = renderColumnMinMaxDimensions();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when nothing is selected even if a bound row was revealed', () => {
    // mock
    reveal('minWidth');

    // before
    const { container } = renderColumnMinMaxDimensions();

    // result
    expect(container).toBeEmptyDOMElement();
  });

  it('should render an empty Min width field when the row is revealed with no value on the node', () => {
    // mock
    const frameId = addFrameNode();

    store.dispatch(setSelection([frameId]));
    reveal('minWidth');

    // before
    renderColumnMinMaxDimensions();

    // result
    expect(screen.getByLabelText('Min width')).toHaveValue(null);
    expect(screen.getByText('Min')).toBeInTheDocument();
    expect(screen.queryByLabelText('Min height')).toBeNull();
  });

  it('should populate the revealed Min width field with the value stored on the node', () => {
    // mock
    const frameId = addFrameNode({ minWidth: 20 });

    store.dispatch(setSelection([frameId]));
    reveal('minWidth');

    // before
    renderColumnMinMaxDimensions();

    // result
    expect(screen.getByLabelText('Min width')).toHaveValue(20);
  });

  it('should render only the revealed rows', () => {
    // mock
    const frameId = addFrameNode({ maxHeight: 95 });

    store.dispatch(setSelection([frameId]));
    reveal('maxHeight');

    // before
    renderColumnMinMaxDimensions();

    // result
    expect(screen.getByLabelText('Max height')).toHaveValue(95);
    expect(screen.queryByLabelText('Max width')).toBeNull();
    expect(screen.queryByLabelText('Min width')).toBeNull();
  });

  it('should render all four fields when every bound is revealed', () => {
    // mock
    const frameId = addFrameNode({ maxHeight: 90, maxWidth: 80, minHeight: 30, minWidth: 20 });

    store.dispatch(setSelection([frameId]));
    reveal('maxHeight', 'maxWidth', 'minHeight', 'minWidth');

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
    reveal('minWidth');

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
