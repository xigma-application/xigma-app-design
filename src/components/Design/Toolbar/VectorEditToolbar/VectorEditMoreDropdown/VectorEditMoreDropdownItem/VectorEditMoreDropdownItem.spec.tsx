import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdownItem from './VectorEditMoreDropdownItem';
import { Popover } from 'shared';

// store
import { setActiveTool } from 'store/design/slice';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderVectorEditMoreDropdownItem = (selected: boolean): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <Popover trigger={<span>open</span>}>
        <VectorEditMoreDropdownItem selected={selected} tool={{ shortcut: 'M', toolName: ToolName.shapeBuilder }} />
      </Popover>
    </Provider>,
  );

describe('VectorEditMoreDropdownItem', () => {
  beforeEach(() => {
    store.dispatch(setActiveTool(ToolName.default));
  });

  it('should render the tool label and shortcut', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderVectorEditMoreDropdownItem(false);
    await user.click(screen.getByRole('button', { name: 'open' }));

    // result
    expect(screen.getByText('Shape builder')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('should dispatch setActiveTool with the tool name on click', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderVectorEditMoreDropdownItem(false);
    await user.click(screen.getByRole('button', { name: 'open' }));

    // action
    await user.click(screen.getByText('Shape builder'));

    // result
    expect(store.getState().design.activeTool).toBe(ToolName.shapeBuilder);
  });
});
