import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import GroupFlow from './GroupFlow';
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
        <GroupFlow />
      </TooltipProvider>
    </Provider>,
  );

describe('GroupFlow behaviors', () => {
  it('should turn the selected group into a frame with the picked auto layout', () => {
    // mock
    const groupId = selectNewGroup('flow');

    // before
    renderComponent();

    // action
    fireEvent.click(screen.getByLabelText('Horizontal'));

    // result
    expect(selectNodes(store.getState())[groupId]).toMatchObject({ layoutMode: 'horizontal', type: NodeType.frame });
  });
});
