import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdown from './VectorEditMoreDropdown';
import { TooltipProvider } from 'shared';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderVectorEditMoreDropdown = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <TooltipProvider>
        <VectorEditMoreDropdown />
      </TooltipProvider>
    </Provider>,
  );

describe('VectorEditMoreDropdown', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should render the More placeholder before any More tool has ever been picked', () => {
    // before
    renderVectorEditMoreDropdown();

    // result
    expect(screen.getByText('More')).toBeInTheDocument();
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
});
