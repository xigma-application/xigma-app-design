import { fireEvent, render, screen } from '@testing-library/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Provider } from 'react-redux';

// components
import GroupHeaderMenu from './GroupHeaderMenu';

// store
import { addNode, addNodes, groupNodes, moveNodes, setSelection } from 'store/design/slice';
import { selectActivePage, selectNodes, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

const makeRectangle = (id: string, x: number): TRectangleNode => ({
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 40,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 40,
  x,
  y: 0,
});

const selectNewGroup = (prefix: string): string => {
  const ids = [`${prefix}A`, `${prefix}B`];

  store.dispatch(addNodes({ nodes: [makeRectangle(ids[0], 0), makeRectangle(ids[1], 60)], rootIds: ids }));
  store.dispatch(setSelection(ids));
  store.dispatch(groupNodes());

  return selectSelectedIds(store.getState())[0];
};

const renderComponent = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <PopoverPrimitive.Root open>
        <GroupHeaderMenu />
      </PopoverPrimitive.Root>
    </Provider>,
  );

describe('GroupHeaderMenu behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should turn the selected group into a section', () => {
    // mock
    const groupId = selectNewGroup('menuSection');

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByText('Section'));

    // result
    expect(selectNodes(store.getState())[groupId].type).toBe(NodeType.section);
  });

  it('should turn the selected group into a frame', () => {
    // mock
    const groupId = selectNewGroup('menuFrame');

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByText('Frame'));

    // result
    expect(selectNodes(store.getState())[groupId].type).toBe(NodeType.frame);
  });

  it('should turn the selected group into a frame of the picked preset size', () => {
    // mock
    const groupId = selectNewGroup('menuPreset');

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByText('iPhone 17'));

    // result
    expect(selectNodes(store.getState())[groupId]).toMatchObject({ height: 874, type: NodeType.frame, width: 402 });
  });

  it('should disable Section for a group inside a frame', () => {
    // mock
    store.dispatch(
      addNode({
        childIds: [],
        clipContent: true,
        fills: [],
        height: 400,
        name: 'Host',
        parentId: null,
        rotation: 0,
        type: NodeType.frame,
        width: 400,
        x: 0,
        y: 0,
      }),
    );
    const { rootOrder } = selectActivePage(store.getState());
    const hostId = rootOrder[rootOrder.length - 1];
    const groupId = selectNewGroup('menuNested');
    store.dispatch(moveNodes({ nodeIds: [groupId], targetIndex: 0, targetParentId: hostId }));
    store.dispatch(setSelection([groupId]));

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByText('Section'));

    // result
    expect(selectNodes(store.getState())[groupId].type).toBe(NodeType.group);
  });
});
