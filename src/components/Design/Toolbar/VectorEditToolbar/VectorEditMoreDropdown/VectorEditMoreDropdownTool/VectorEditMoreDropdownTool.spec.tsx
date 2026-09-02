import userEvent from '@testing-library/user-event';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdownTool from './VectorEditMoreDropdownTool';
import { TooltipProvider } from 'shared';

// store
import { addNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const renderVectorEditMoreDropdownTool = (toolName: ToolName.shapeBuilder | ToolName.variableWidth): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditMoreDropdownTool toolName={toolName} />
      </TooltipProvider>
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

describe('VectorEditMoreDropdownTool', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should render the displayed tool as inactive when a different tool is active', () => {
    // before
    renderVectorEditMoreDropdownTool(ToolName.shapeBuilder);

    // result
    expect(screen.getByRole('button', { name: 'Shape builder' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render the displayed tool as active when it is the real active tool', () => {
    // before
    act(() => store.dispatch(setActiveTool(ToolName.shapeBuilder)));

    renderVectorEditMoreDropdownTool(ToolName.shapeBuilder);

    // result
    expect(screen.getByRole('button', { name: 'Shape builder' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should dispatch setActiveTool with the displayed tool on click', () => {
    // before
    renderVectorEditMoreDropdownTool(ToolName.shapeBuilder);

    // action
    act(() => {
      screen.getByRole('button', { name: 'Shape builder' }).click();
    });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.shapeBuilder);
  });

  it('should disable the displayed button and not switch tools when Variable Width has no eligible node being edited', () => {
    // before
    renderVectorEditMoreDropdownTool(ToolName.variableWidth);

    // result
    expect(screen.getByRole('button', { name: 'Variable width' })).toBeDisabled();

    // action
    act(() => {
      screen.getByRole('button', { name: 'Variable width' }).click();
    });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.default);
  });

  it('should enable the displayed button and switch tools when Variable Width has an eligible node being edited', () => {
    // mock
    const nodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    renderVectorEditMoreDropdownTool(ToolName.variableWidth);

    // result
    expect(screen.getByRole('button', { name: 'Variable width' })).toBeEnabled();

    // action
    act(() => {
      screen.getByRole('button', { name: 'Variable width' }).click();
    });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.variableWidth);
  });

  it('should open the dropdown from the small chevron trigger and list both tools', async () => {
    // mock
    const user = userEvent.setup();
    const nodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    renderVectorEditMoreDropdownTool(ToolName.shapeBuilder);

    // action
    await user.click(screen.getByRole('button', { name: 'More' }));

    // result
    expect(screen.getByText('Shape builder')).toBeInTheDocument();
    expect(screen.getByText('Variable width')).toBeInTheDocument();

    // action
    await user.click(screen.getByText('Variable width'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.variableWidth);
  });
});
