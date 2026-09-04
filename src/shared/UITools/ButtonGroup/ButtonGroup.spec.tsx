import { fireEvent, render, screen } from '@testing-library/react';

// components
import ButtonGroup, { TButtonGroupProps } from './ButtonGroup';
import { TooltipProvider } from 'shared';

const renderButtonGroup = (props: TButtonGroupProps): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ButtonGroup {...props} />
    </TooltipProvider>,
  );

describe('ButtonGroup snapshots', () => {
  it('should render one button per entry', () => {
    // before
    const { asFragment } = renderButtonGroup({
      buttons: [
        { ariaLabel: 'Align left', name: 'AlignHorizontalLeft', onClick: vi.fn() },
        { ariaLabel: 'Align center', name: 'AlignHorizontalCenter', onClick: vi.fn() },
      ],
    });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ButtonGroup behaviors', () => {
  it('should call onClick for the clicked button only', () => {
    // mock
    const onClickLeft = vi.fn();
    const onClickCenter = vi.fn();

    // before
    renderButtonGroup({
      buttons: [
        { ariaLabel: 'Align left', name: 'AlignHorizontalLeft', onClick: onClickLeft },
        { ariaLabel: 'Align center', name: 'AlignHorizontalCenter', onClick: onClickCenter },
      ],
    });

    // action
    fireEvent.click(screen.getByLabelText('Align left'));

    // result
    expect(onClickLeft).toHaveBeenCalledTimes(1);
    expect(onClickCenter).not.toHaveBeenCalled();
  });

  it('should disable a button when its entry is disabled', () => {
    // before
    renderButtonGroup({ buttons: [{ ariaLabel: 'Align left', disabled: true, name: 'AlignHorizontalLeft', onClick: vi.fn() }] });

    // result
    expect(screen.getByLabelText('Align left')).toBeDisabled();
  });

  it('should expose the e2e value on the button group wrapper', () => {
    // before
    const { container } = renderButtonGroup({
      buttons: [{ ariaLabel: 'Align left', name: 'AlignHorizontalLeft', onClick: vi.fn() }],
      e2eValue: 'horizontal-alignment',
    });

    // result
    expect(container.querySelector('[data-test-button-group="horizontal-alignment"]')).not.toBeNull();
  });
});
