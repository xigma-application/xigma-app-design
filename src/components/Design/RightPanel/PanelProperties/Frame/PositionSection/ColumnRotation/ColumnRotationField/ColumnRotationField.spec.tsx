import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColumnRotationField from './ColumnRotationField';

const renderColumnRotationField = (overrides: Partial<Parameters<typeof ColumnRotationField>[0]> = {}): ReturnType<typeof render> =>
  render(
    <ColumnRotationField
      ariaLabel="Rotation"
      e2eValue="rotation"
      onBlur={vi.fn()}
      onDragEnd={vi.fn()}
      onDragStart={vi.fn()}
      onScrub={vi.fn()}
      value={0}
      {...overrides}
    />,
  );

describe('ColumnRotationField snapshots', () => {
  it('should render the field with its icon and value', () => {
    // before
    const { asFragment } = renderColumnRotationField();

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnRotationField behaviors', () => {
  it('should render the current value in the input, suffixed with the degree sign', () => {
    // before
    renderColumnRotationField({ value: 45 });

    // result
    expect(screen.getByLabelText('Rotation')).toHaveValue('45°');
  });

  it('should call onBlur when the input loses focus', () => {
    // mock
    const onBlur = vi.fn();

    // before
    renderColumnRotationField({ onBlur });
    const input = screen.getByLabelText('Rotation');

    // action
    fireEvent.blur(input);

    // result
    expect(onBlur).toHaveBeenCalled();
  });
});
