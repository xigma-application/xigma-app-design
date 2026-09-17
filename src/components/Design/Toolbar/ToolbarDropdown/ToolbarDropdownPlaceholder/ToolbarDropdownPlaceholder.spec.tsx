import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import ToolbarDropdownPlaceholder from './ToolbarDropdownPlaceholder';

const renderToolbarDropdownPlaceholder = (): ReturnType<typeof render> =>
  render(
    <ToolbarDropdownPlaceholder label="More" triggerAriaLabel="More">
      <div>Menu content</div>
    </ToolbarDropdownPlaceholder>,
  );

describe('ToolbarDropdownPlaceholder', () => {
  it('should render the label with a trigger button', () => {
    // before
    renderToolbarDropdownPlaceholder();

    // result
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('should show its children once opened', async () => {
    // mock
    const user = userEvent.setup();

    // before
    renderToolbarDropdownPlaceholder();

    // action
    await user.click(screen.getByRole('button', { name: 'More' }));

    // result
    expect(screen.getByText('Menu content')).toBeInTheDocument();
  });
});
