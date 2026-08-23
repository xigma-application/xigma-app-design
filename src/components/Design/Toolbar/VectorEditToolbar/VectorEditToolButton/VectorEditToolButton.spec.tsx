import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditToolButton from './VectorEditToolButton';
import { TooltipProvider } from 'shared';

// others
import { TVectorEditTool } from '../constants';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderVectorEditToolButton = (isActive: boolean, tool: TVectorEditTool): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditToolButton isActive={isActive} tool={tool} />
      </TooltipProvider>
    </Provider>,
  );

describe('VectorEditToolButton', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should render the tool label and reflect the isActive prop', () => {
    // before
    renderVectorEditToolButton(true, { icon: 'MoveVectorTool', labelKey: 'design.toolbar.tool.default', toolName: ToolName.default });

    // result
    expect(screen.getByText('Move')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('should dispatch setActiveTool with the tool name on click', () => {
    // before
    renderVectorEditToolButton(false, {
      icon: 'BendTool',
      labelKey: 'design.toolbar.vectorEditToolbar.tool.bend',
      toolName: ToolName.bend,
    });

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.bend);
  });

  it('should render a tool with no ToolName as inert — never active, no click handler', () => {
    // before
    act(() => store.dispatch(setActiveTool(ToolName.pen)));

    renderVectorEditToolButton(false, { icon: 'PaintTool', labelKey: 'design.toolbar.vectorEditToolbar.tool.paint' });

    // result
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-pressed', 'false');

    // action — clicking an inert tool must not throw or dispatch anything
    fireEvent.click(button);

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.pen);
  });
});
