import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

// components
import VectorEditMoreDropdownItems from './VectorEditMoreDropdownItems';
import { UITools } from 'shared';

// store
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';

const renderVectorEditMoreDropdownItems = (lastMoreTool: ToolName | null): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <UITools.Popover trigger={<span>open</span>}>
        <VectorEditMoreDropdownItems lastMoreTool={lastMoreTool} />
      </UITools.Popover>
    </Provider>,
  );

describe('VectorEditMoreDropdownItems', () => {
  it('should list Shape builder and Variable width', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderVectorEditMoreDropdownItems(null);
    await user.click(screen.getByRole('button', { name: 'open' }));

    // result
    expect(screen.getByText('Shape builder')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('Variable width')).toBeInTheDocument();
    expect(screen.getByText('⇧W')).toBeInTheDocument();
  });
});
