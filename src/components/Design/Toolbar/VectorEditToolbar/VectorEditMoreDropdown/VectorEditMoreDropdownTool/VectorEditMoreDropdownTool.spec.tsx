import userEvent from '@testing-library/user-event';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdownTool from './VectorEditMoreDropdownTool';
import { TooltipProvider } from 'shared';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderVectorEditMoreDropdownTool = (toolName: ToolName.shapeBuilder | ToolName.variableWidth): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditMoreDropdownTool toolName={toolName} />
      </TooltipProvider>
    </Provider>,
  );

describe('VectorEditMoreDropdownTool', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
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
    renderVectorEditMoreDropdownTool(ToolName.variableWidth);

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

    // before
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
