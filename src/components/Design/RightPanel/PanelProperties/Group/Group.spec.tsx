import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import Group from './Group';
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
      <CanvasRefsProvider>
        <TooltipProvider>
          <Group />
        </TooltipProvider>
      </CanvasRefsProvider>
    </Provider>,
  );

describe('Group behaviors', () => {
  afterEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should show the Group header, Position, Layout and the sections its rectangle children share', () => {
    // mock
    selectNewGroup('panel');

    // before
    renderComponent();

    // result
    expect(screen.getByText('Group')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Fill')).toBeInTheDocument();
    expect(screen.getByText('Stroke')).toBeInTheDocument();
  });

  it('should hide the child sections when a child has none of them', () => {
    // mock
    store.dispatch(
      addNodes({
        nodes: [
          {
            fill: '#ffffff',
            flipX: false,
            flipY: false,
            height: 20,
            id: 'panelEllipse',
            name: 'Polygon',
            parentId: null,
            rotation: 0,
            sides: 5,
            type: NodeType.polygon,
            width: 20,
            x: 0,
            y: 0,
          } as never,
        ],
        rootIds: ['panelEllipse'],
      }),
    );
    store.dispatch(setSelection(['panelEllipse']));
    store.dispatch(groupNodes());

    // before
    renderComponent();

    // result
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.queryByText('Fill')).not.toBeInTheDocument();
  });
});
