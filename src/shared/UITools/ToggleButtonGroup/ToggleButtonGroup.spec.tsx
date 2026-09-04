import { fireEvent, render, screen } from '@testing-library/react';

// components
import ToggleButtonGroup, { TToggleButtonGroupProps } from './ToggleButtonGroup';
import { TooltipProvider } from 'shared';

const renderToggleButtonGroup = (props: TToggleButtonGroupProps): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <ToggleButtonGroup {...props} />
    </TooltipProvider>,
  );

describe('ToggleButtonGroup snapshots', () => {
  it('should render one button per entry', () => {
    // before
    const { asFragment } = renderToggleButtonGroup({
      onChange: vi.fn(),
      toggleButtons: [
        { ariaLabel: 'Free form', icon: 'FlowDefault', value: 'freeForm' },
        { ariaLabel: 'Vertical', icon: 'FlowVertical', value: 'vertical' },
      ],
      value: 'freeForm',
    });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ToggleButtonGroup behaviors', () => {
  it('should mark the button matching the current value as selected', () => {
    // before
    renderToggleButtonGroup({
      onChange: vi.fn(),
      toggleButtons: [
        { ariaLabel: 'Free form', icon: 'FlowDefault', value: 'freeForm' },
        { ariaLabel: 'Vertical', icon: 'FlowVertical', value: 'vertical' },
      ],
      value: 'vertical',
    });

    // result
    expect(screen.getByLabelText('Vertical')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Free form')).toHaveAttribute('aria-pressed', 'false');
  });

  it('should call onChange with the clicked button value', () => {
    // mock
    const onChange = vi.fn();

    // before
    renderToggleButtonGroup({
      onChange,
      toggleButtons: [
        { ariaLabel: 'Free form', icon: 'FlowDefault', value: 'freeForm' },
        { ariaLabel: 'Vertical', icon: 'FlowVertical', value: 'vertical' },
      ],
      value: 'freeForm',
    });

    // action
    fireEvent.click(screen.getByLabelText('Vertical'));

    // result
    expect(onChange).toHaveBeenCalledWith('vertical');
  });

  it('should expose the e2e value on the toggle button group wrapper', () => {
    // before
    const { container } = renderToggleButtonGroup({
      e2eValue: 'flow',
      onChange: vi.fn(),
      toggleButtons: [{ ariaLabel: 'Free form', icon: 'FlowDefault', value: 'freeForm' }],
      value: 'freeForm',
    });

    // result
    expect(container.querySelector('[data-test-toggle-button-group="flow"]')).not.toBeNull();
  });
});
