import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditPaintTool from './VectorEditPaintTool';
import { TooltipProvider } from 'shared';

// store
import { DEFAULT_PAINT } from 'store/design/constants';
import { setPaint } from 'store/design/slice';
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
    store.dispatch(setPaint(DEFAULT_PAINT));
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

  it('should show a gradient preview in the trigger swatch once the Gradient tab is selected', () => {
    // before
    renderVectorEditPaintTool(true);
    fireEvent.click(screen.getByRole('button', { name: 'Paint' }));

    // action
    fireEvent.click(screen.getByText('Gradient'));

    // result — the exact swatch, not its wrapper (whose class also matches the "swatch" substring)
    const swatch = document.querySelector('[class*="VectorEditPaintTool__swatch_"]') as HTMLElement;

    expect(swatch.style.background).toContain('linear-gradient');
  });

  it('should commit a real gradient paint to the store as soon as the Gradient tab opens, before touching any stop', () => {
    // before
    renderVectorEditPaintTool(true);
    fireEvent.click(screen.getByRole('button', { name: 'Paint' }));

    // action
    fireEvent.click(screen.getByText('Gradient'));

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paint).toMatchObject({ type: 'gradient-linear' });
  });

  it('should revert to a solid paint in the store when switching back from Gradient to Solid', () => {
    // before
    renderVectorEditPaintTool(true);
    fireEvent.click(screen.getByRole('button', { name: 'Paint' }));
    fireEvent.click(screen.getByText('Gradient'));

    // action
    fireEvent.click(screen.getByText('Solid'));

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paint).toMatchObject({ type: 'solid' });
  });

  it('should dispatch setPaint when a preset is picked from the open panel', () => {
    // before
    renderVectorEditPaintTool(true);
    fireEvent.click(screen.getByRole('button', { name: 'Paint' }));

    // find — the first preset is opaque white
    const swatch = document.querySelectorAll('[class*="Footer__colors"] > div')[0];

    // action
    fireEvent.click(swatch);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].paint).toEqual({
      color: '#ffffff',
      opacity: 100,
      type: 'solid',
    });
  });
});
