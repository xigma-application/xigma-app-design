import { fireEvent, render, screen } from '@testing-library/react';

// components
import DistributeMenuButton, { TDistributeMenuButtonProps } from './DistributeMenuButton';
import { TooltipProvider } from 'shared';

const renderDistributeMenuButton = (props: TDistributeMenuButtonProps): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <DistributeMenuButton {...props} />
    </TooltipProvider>,
  );

describe('DistributeMenuButton snapshots', () => {
  it('should render the more actions trigger', () => {
    // before
    const { asFragment } = renderDistributeMenuButton({
      enabledActions: { horizontal: false, tidyUp: false, vertical: false },
      onAction: vi.fn(),
      tidyUpIcon: 'TidyUpVertical',
      triggerIcon: 'DistributeVerticalSpacing',
    });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('DistributeMenuButton behaviors', () => {
  it('should call onAction with the picked enabled action', () => {
    // mock
    const onAction = vi.fn();

    // before
    renderDistributeMenuButton({
      enabledActions: { horizontal: true, tidyUp: true, vertical: false },
      onAction,
      tidyUpIcon: 'TidyUpHorizontal',
      triggerIcon: 'TidyUpHorizontal',
    });

    // action
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    fireEvent.click(screen.getByText('Tidy up'));

    // result
    expect(onAction).toHaveBeenCalledWith('tidyUp');
  });
});
