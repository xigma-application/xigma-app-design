import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdownPlaceholder from './VectorEditMoreDropdownPlaceholder';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderVectorEditMoreDropdownPlaceholder = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <VectorEditMoreDropdownPlaceholder />
    </Provider>,
  );

describe('VectorEditMoreDropdownPlaceholder', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
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
