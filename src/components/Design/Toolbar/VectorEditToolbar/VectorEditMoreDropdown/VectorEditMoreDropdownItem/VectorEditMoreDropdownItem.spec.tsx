import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdownItem from './VectorEditMoreDropdownItem';
import { Popover } from 'shared';

// store
import { addNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TVectorEditMoreTool } from '../../constants';

const renderVectorEditMoreDropdownItem = (selected: boolean, tool: TVectorEditMoreTool): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <Popover trigger={<span>open</span>}>
        <VectorEditMoreDropdownItem selected={selected} tool={tool} />
      </Popover>
    </Provider>,
  );

const addStraightVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
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

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('VectorEditMoreDropdownItem', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should render the tool label and shortcut', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderVectorEditMoreDropdownItem(false, { shortcut: 'M', toolName: ToolName.shapeBuilder });
    await user.click(screen.getByRole('button', { name: 'open' }));

    // result
    expect(screen.getByText('Shape builder')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('should dispatch setActiveTool with the tool name on click', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderVectorEditMoreDropdownItem(false, { shortcut: 'M', toolName: ToolName.shapeBuilder });
    await user.click(screen.getByRole('button', { name: 'open' }));

    // action
    await user.click(screen.getByText('Shape builder'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.shapeBuilder);
  });

  it('should not switch tools when clicking Variable Width while no eligible node is being edited', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderVectorEditMoreDropdownItem(false, { shortcut: 'W', toolName: ToolName.variableWidth });
    await user.click(screen.getByRole('button', { name: 'open' }));

    // action
    await user.click(screen.getByText('Variable width'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should switch to Variable Width when clicked while an eligible node is being edited', async () => {
    // mock
    const user = userEvent.setup();
    const nodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    renderVectorEditMoreDropdownItem(false, { shortcut: 'W', toolName: ToolName.variableWidth });
    await user.click(screen.getByRole('button', { name: 'open' }));

    // action
    await user.click(screen.getByText('Variable width'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.variableWidth);
  });
});
