import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdownPlaceholder from './VectorEditMoreDropdownPlaceholder';

// store
import { addNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const renderVectorEditMoreDropdownPlaceholder = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <VectorEditMoreDropdownPlaceholder />
    </Provider>,
  );

const addStraightVectorNode = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('VectorEditMoreDropdownPlaceholder', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should render the More label with a trigger button', () => {
    // before
    renderVectorEditMoreDropdownPlaceholder();

    // result
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('should list Shape builder and Variable width once opened, and dispatch setActiveTool on click', async () => {
    // mock
    const user = userEvent.setup();
    const nodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    renderVectorEditMoreDropdownPlaceholder();

    // action
    await user.click(screen.getByRole('button', { name: 'More' }));

    // result
    expect(screen.getByText('Shape builder')).toBeInTheDocument();
    expect(screen.getByText('Variable width')).toBeInTheDocument();

    // action
    await user.click(screen.getByText('Variable width'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.variableWidth);
    expect(store.getState().design.lastMoreTool).toBe(ToolName.variableWidth);
  });
});
