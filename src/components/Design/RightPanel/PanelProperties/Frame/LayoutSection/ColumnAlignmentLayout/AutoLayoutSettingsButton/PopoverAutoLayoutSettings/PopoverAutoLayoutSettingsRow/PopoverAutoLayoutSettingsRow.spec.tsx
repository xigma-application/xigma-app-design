import { fireEvent, render, screen } from '@testing-library/react';

// components
import PopoverAutoLayoutSettingsRow from './PopoverAutoLayoutSettingsRow';

describe('PopoverAutoLayoutSettingsRow', () => {
  it('should render the label and control', () => {
    // before
    render(
      <PopoverAutoLayoutSettingsRow label="Inside stroke">
        <span>Included</span>
      </PopoverAutoLayoutSettingsRow>,
    );

    // result
    expect(screen.getByText('Inside stroke')).toBeInTheDocument();
    expect(screen.getByText('Included')).toBeInTheDocument();
  });

  it('should not apply the disabled modifier class by default', () => {
    // before
    const { container } = render(
      <PopoverAutoLayoutSettingsRow label="Auto spacing">
        <span>Between</span>
      </PopoverAutoLayoutSettingsRow>,
    );

    // result
    expect(container.querySelector('[class*="--disabled"]')).toBeNull();
  });

  it('should apply the disabled modifier class when disabled', () => {
    // before
    const { container } = render(
      <PopoverAutoLayoutSettingsRow disabled label="Auto spacing">
        <span>Between</span>
      </PopoverAutoLayoutSettingsRow>,
    );

    // result
    expect(container.querySelector('[class*="--disabled"]')).not.toBeNull();
  });

  it('should call onMouseEnter when the pointer enters the row', () => {
    // mock
    const onMouseEnter = vi.fn();

    // before
    render(
      <PopoverAutoLayoutSettingsRow label="Inside stroke" onMouseEnter={onMouseEnter}>
        <span>Included</span>
      </PopoverAutoLayoutSettingsRow>,
    );

    // action
    fireEvent.mouseEnter(screen.getByText('Inside stroke').parentElement!);

    // result
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('should call onMouseLeave when the pointer leaves the row', () => {
    // mock
    const onMouseLeave = vi.fn();

    // before
    render(
      <PopoverAutoLayoutSettingsRow label="Inside stroke" onMouseLeave={onMouseLeave}>
        <span>Included</span>
      </PopoverAutoLayoutSettingsRow>,
    );

    // action
    fireEvent.mouseLeave(screen.getByText('Inside stroke').parentElement!);

    // result
    expect(onMouseLeave).toHaveBeenCalledTimes(1);
  });
});
