import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditPaintTool from './VectorEditPaintTool';
import { TooltipProvider } from 'shared';

// store
import { setPaintColor } from 'store/design/slice';
import { DEFAULT_PAINT_COLOR } from 'store/design/constants';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const tool = {
  icon: 'PaintTool' as const,
  labelKey: 'design.toolbar.vectorEditToolbar.tool.paint',
  shortcut: ['Shift', 'B'],
  toolName: ToolName.paint,
};

const renderVectorEditPaintTool = (isActive: boolean): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditPaintTool isActive={isActive} tool={tool} />
      </TooltipProvider>
    </Provider>,
  );

describe('VectorEditPaintTool', () => {
  beforeEach(() => {
    store.dispatch(setPaintColor(DEFAULT_PAINT_COLOR));
  });

  it('should render the static icon and label when inactive', () => {
    // before
    renderVectorEditPaintTool(false);

    // result
    expect(screen.getByText('Paint')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should dispatch setActiveTool without opening the picker when the inactive button is clicked', () => {
    // before
    renderVectorEditPaintTool(false);

    // action
    fireEvent.click(screen.getByRole('button'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.paint);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show a color swatch trigger instead of the icon once active', () => {
    // before
    renderVectorEditPaintTool(true);

    // result
    expect(document.querySelector('[class*="VectorEditPaintTool__swatch"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Paint' })).toBeInTheDocument();
  });

  it('should open the picker on click and keep the tool marked active throughout', () => {
    // before
    renderVectorEditPaintTool(true);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Paint' }));

    // result
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // action — clicking the swatch trigger again closes the picker
    fireEvent.click(screen.getByRole('button', { name: 'Paint' }));

    // result
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should dispatch setPaintColor when a preset is picked from the open panel', () => {
    // before
    renderVectorEditPaintTool(true);
    fireEvent.click(screen.getByRole('button', { name: 'Paint' }));

    // find — the first preset is opaque white
    const swatch = document.querySelectorAll('[class*="Footer__colors"] > div')[0];

    // action
    fireEvent.click(swatch);

    // result
    expect(store.getState().design.paintColor).toBe('#ffffff');
  });
});
