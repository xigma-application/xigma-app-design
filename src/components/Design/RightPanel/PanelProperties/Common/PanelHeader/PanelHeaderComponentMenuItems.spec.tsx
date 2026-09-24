import { fireEvent, render, screen } from '@testing-library/react';

// components
import PanelHeaderComponentMenuItems from './PanelHeaderComponentMenuItems';
import { UITools } from 'shared';

const renderItems = (): ReturnType<typeof render> =>
  render(
    <UITools.ButtonMenu trigger="open" triggerAriaLabel="Open menu">
      <PanelHeaderComponentMenuItems />
    </UITools.ButtonMenu>,
  );

describe('PanelHeaderComponentMenuItems behaviors', () => {
  it('should render the three component actions with the create component shortcut', () => {
    // before
    renderItems();

    // action
    fireEvent.click(screen.getByLabelText('Open menu'));

    // result
    expect(screen.getByText('Create component')).toBeInTheDocument();
    expect(screen.getByText('Create multiple components')).toBeInTheDocument();
    expect(screen.getByText('Create component set')).toBeInTheDocument();
  });
});
