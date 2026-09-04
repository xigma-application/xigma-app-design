import { fireEvent, render, screen, within } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Provider } from 'react-redux';

// components
import FrameHeaderMenu from './FrameHeaderMenu';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';

const renderFrameHeaderMenu = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <PopoverPrimitive.Root open>
        <FrameHeaderMenu />
      </PopoverPrimitive.Root>
    </Provider>,
  );

const addFrameNode = (): string => {
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
      x: 0,
      y: 0,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('FrameHeaderMenu snapshots', () => {
  it('should render the type switcher and the size preset groups', () => {
    // before
    const { asFragment } = renderFrameHeaderMenu();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FrameHeaderMenu behaviors', () => {
  it('should render the current element type as selected', () => {
    // before
    renderFrameHeaderMenu();

    // result
    expect(screen.getByText('Frame')).toBeInTheDocument();
  });

  it('should render the Section and Group type options', () => {
    // before
    renderFrameHeaderMenu();

    // result
    expect(screen.getByText('Section')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('should render a size preset with its dimensions', () => {
    // before
    renderFrameHeaderMenu();
    const item = screen.getByText('iPhone 17').parentElement as HTMLElement;

    // result
    expect(within(item).getByText('402×874')).toBeInTheDocument();
  });

  it('should resize the selected frame when a size preset is clicked', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));

    // before
    renderFrameHeaderMenu();

    // action
    fireEvent.click(screen.getByText('iPhone 17'));

    // result
    const node = selectActivePage(store.getState()).nodes[frameId];
    expect(node).toMatchObject({ height: 874, width: 402 });

    // cleanup
    store.dispatch(setSelection([]));
  });

  it('should convert the selection to a section when clicked', () => {
    // mock
    const frameId = addFrameNode();
    store.dispatch(setSelection([frameId]));

    // before
    renderFrameHeaderMenu();

    // action
    fireEvent.click(screen.getByText('Section'));

    // result
    const node = selectActivePage(store.getState()).nodes[frameId];
    expect(node.type).toBe(NodeType.section);

    // cleanup
    store.dispatch(setSelection([]));
  });
});
