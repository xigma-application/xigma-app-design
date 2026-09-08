import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import ColumnPadding from './ColumnPadding';
import { TooltipProvider } from 'shared';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

const renderColumnPadding = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <ColumnPadding />
      </TooltipProvider>
    </Provider>,
  );

const addFrame = (overrides: Partial<TFrameNode> = {}): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
      fill: '#ff0000',
      height: 100,
      layoutMode: LayoutMode.horizontal,
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

const read = (id: string): TFrameNode => selectActivePage(store.getState()).nodes[id] as TFrameNode;

describe('ColumnPadding', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should render nothing for a freeform frame', () => {
    const id = addFrame({ layoutMode: undefined });

    store.dispatch(setSelection([id]));

    const { container } = renderColumnPadding();

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the two merged inputs for an auto-layout frame', () => {
    const id = addFrame({ paddingBottom: 8, paddingLeft: 5, paddingRight: 2, paddingTop: 8 });

    store.dispatch(setSelection([id]));
    renderColumnPadding();

    expect((screen.getByLabelText('Horizontal padding') as HTMLInputElement).value).toBe('5, 2');
    expect((screen.getByLabelText('Vertical padding') as HTMLInputElement).value).toBe('8');
    expect(screen.queryByLabelText('Left padding')).toBeNull();
  });

  it('should reveal the four individual inputs when the Individual padding button is toggled', () => {
    const id = addFrame();

    store.dispatch(setSelection([id]));
    renderColumnPadding();

    fireEvent.click(screen.getByLabelText('Individual padding'));

    expect(screen.getByLabelText('Left padding')).toBeInTheDocument();
    expect(screen.getByLabelText('Top padding')).toBeInTheDocument();
    expect(screen.getByLabelText('Right padding')).toBeInTheDocument();
    expect(screen.getByLabelText('Bottom padding')).toBeInTheDocument();
    expect(screen.queryByLabelText('Horizontal padding')).toBeNull();
  });

  it('should split a typed "5,2" into left and right on blur', () => {
    const id = addFrame();

    store.dispatch(setSelection([id]));
    renderColumnPadding();

    const input = screen.getByLabelText('Horizontal padding');

    fireEvent.change(input, { target: { value: '5,2' } });
    fireEvent.blur(input);

    expect(read(id).paddingLeft).toBe(5);
    expect(read(id).paddingRight).toBe(2);
  });

  it('should apply a typed single number to both sides of a pair on blur', () => {
    const id = addFrame();

    store.dispatch(setSelection([id]));
    renderColumnPadding();

    const input = screen.getByLabelText('Vertical padding');

    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.blur(input);

    expect(read(id).paddingTop).toBe(12);
    expect(read(id).paddingBottom).toBe(12);
  });

  it('should move only one side from an individual input', () => {
    const id = addFrame({ paddingLeft: 4, paddingRight: 4 });

    store.dispatch(setSelection([id]));
    renderColumnPadding();

    fireEvent.click(screen.getByLabelText('Individual padding'));

    const leftInput = screen.getByLabelText('Left padding');

    fireEvent.change(leftInput, { target: { value: '20' } });
    fireEvent.blur(leftInput);

    expect(read(id).paddingLeft).toBe(20);
    expect(read(id).paddingRight).toBe(4);
  });
});
