import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import GroupHeaderButtons from './GroupHeaderButtons';
import { TooltipProvider } from 'shared';

// store
import { addNodes, groupNodes, setSelection } from 'store/design/slice';
import { selectNodes, selectSelectedIds } from 'store/design/selectors';
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
      <TooltipProvider>
        <GroupHeaderButtons />
      </TooltipProvider>
    </Provider>,
  );

describe('GroupHeaderButtons behaviors', () => {
  it('should turn the selected group into a mask from the Mask button', () => {
    // mock
    const groupId = selectNewGroup('buttonsMask');

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByLabelText('Use as mask'));

    // result
    expect(selectNodes(store.getState())[groupId].type).toBe(NodeType.mask);
  });

  it('should turn the selected group into a boolean from the Boolean button', () => {
    // mock
    const groupId = selectNewGroup('buttonsBoolean');

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByLabelText('Boolean operations'));

    // result
    expect(selectNodes(store.getState())[groupId].type).toBe(NodeType.boolean);
  });

  it('should show the component split button for several groups and the single button for one', () => {
    // mock
    const firstGroupId = selectNewGroup('buttonsFirst');
    const secondGroupId = selectNewGroup('buttonsSecond');
    store.dispatch(setSelection([firstGroupId, secondGroupId]));

    // before
    const { unmount } = renderComponent();

    // result
    expect(screen.getByLabelText('Component options')).toBeInTheDocument();

    // action
    unmount();
    store.dispatch(setSelection([firstGroupId]));
    renderComponent();

    // result
    expect(screen.queryByLabelText('Component options')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Create component')).toBeInTheDocument();
  });
});
