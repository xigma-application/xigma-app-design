import userEvent from '@testing-library/user-event';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdown from './VectorEditMoreDropdown';
import { TooltipProvider } from 'shared';

// store
import { addNode, setActiveTool, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

const renderVectorEditMoreDropdown = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditMoreDropdown />
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
      strokeWidth: 1,
      strokes: [{ color: '#000000', opacity: 100, type: 'solid' }],
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('VectorEditMoreDropdown', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should render the More placeholder before any More tool has ever been picked', () => {
    // before
    renderVectorEditMoreDropdown();

    // result
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('should list Shape builder and Variable width once the placeholder is opened, and dispatch setActiveTool on click', async () => {
    // mock
    const user = userEvent.setup();
    const nodeId = addStraightVectorNode();

    store.dispatch(setVectorEditingNodeIds([nodeId]));

    // before
    renderVectorEditMoreDropdown();

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

  it('should render the displayed tool once one has been picked', () => {
    // before
    act(() => store.dispatch(setActiveTool(ToolName.shapeBuilder)));

    renderVectorEditMoreDropdown();

    // result
    expect(screen.queryByText('More')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shape builder' })).toBeInTheDocument();
  });

  it('should keep showing the last picked More tool even after switching to an unrelated tool', () => {
    // before
    act(() => {
      store.dispatch(setActiveTool(ToolName.variableWidth));
      store.dispatch(setActiveTool(ToolName.move));
    });

    renderVectorEditMoreDropdown();

    // result
    expect(screen.getByRole('button', { name: 'Variable width' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('should render the displayed tool as active when it is the real active tool', () => {
    // before
    act(() => store.dispatch(setActiveTool(ToolName.shapeBuilder)));

    renderVectorEditMoreDropdown();

    // result
    expect(screen.getByRole('button', { name: 'Shape builder' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should disable the displayed button and not switch tools when Variable Width has no eligible node being edited', () => {
    // before — pick Variable Width as the last More tool, then move away to an unrelated tool, so
    // it's merely *displayed* (not currently active) while still being shown as the dropdown's option
    act(() => {
      store.dispatch(setActiveTool(ToolName.variableWidth));
      store.dispatch(setActiveTool(ToolName.move));
    });

    renderVectorEditMoreDropdown();

    // result
    expect(screen.getByRole('button', { name: 'Variable width' })).toBeDisabled();

    // action
    act(() => {
      screen.getByRole('button', { name: 'Variable width' }).click();
    });

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.move);
  });

  it('should enable the displayed button and switch tools when Variable Width has an eligible node being edited', () => {
    // mock
    const nodeId = addStraightVectorNode();

    act(() => {
      store.dispatch(setActiveTool(ToolName.variableWidth));
      store.dispatch(setActiveTool(ToolName.move));
    });
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    renderVectorEditMoreDropdown();

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

    act(() => store.dispatch(setActiveTool(ToolName.shapeBuilder)));
    store.dispatch(setVectorEditingNodeIds([nodeId]));

    renderVectorEditMoreDropdown();

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
