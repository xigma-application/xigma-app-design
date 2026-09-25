import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import GroupHeader from './GroupHeader';
import { TooltipProvider } from 'shared';

// store
import { addNodes, groupNodes, setSelection } from 'store/design/slice';
import { selectSelectedIds } from 'store/design/selectors';
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
        <GroupHeader />
      </TooltipProvider>
    </Provider>,
  );

describe('GroupHeader behaviors', () => {
  it('should render the Group label with its type menu and buttons', () => {
    // mock
    selectNewGroup('header');

    // before
    renderComponent();

    // result
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Element type')).toBeInTheDocument();
    expect(screen.getByLabelText('Use as mask')).toBeInTheDocument();
  });
});
