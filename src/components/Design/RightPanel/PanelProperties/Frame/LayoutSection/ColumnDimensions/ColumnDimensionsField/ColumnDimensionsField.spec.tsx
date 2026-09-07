import { fireEvent, render, screen } from '@testing-library/react';

// components
import ColumnDimensionsField from './ColumnDimensionsField';

// types
import { SizingMode } from 'types/design/enums';

const renderColumnDimensionsField = (overrides: Partial<Parameters<typeof ColumnDimensionsField>[0]> = {}): ReturnType<typeof render> =>
  render(
    <ColumnDimensionsField
      ariaLabel="Width"
      axis="width"
      e2eValue="width"
      label="W"
      onBlur={vi.fn()}
      onDragEnd={vi.fn()}
      onDragStart={vi.fn()}
      onScrub={vi.fn()}
      value={326}
      {...overrides}
    />,
  );

const getFieldRoot = (container: HTMLElement): HTMLElement => container.querySelector('[data-test-text-field="width"]') as HTMLElement;

describe('ColumnDimensionsField snapshots', () => {
  it('should render the field with its label and value', () => {
    // before
    const { asFragment } = renderColumnDimensionsField();

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the sizing-mode chevron when a sizing mode is given', () => {
    // before
    const { asFragment } = renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.fixed });

    // result
    expect(asFragment()).toMatchSnapshot();
  });

  it('should render the "Hug" text when hugging and not hovered', () => {
    // before
    const { asFragment } = renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.hug });

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('ColumnDimensionsField behaviors', () => {
  it('should render the label', () => {
    // before
    renderColumnDimensionsField();

    // result
    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it('should render the current value in the input', () => {
    // before
    renderColumnDimensionsField({ value: 187 });

    // result
    expect(screen.getByLabelText('Width')).toHaveValue(187);
  });

  it('should call onBlur when the input loses focus', () => {
    // mock
    const onBlur = vi.fn();

    // before
    renderColumnDimensionsField({ onBlur });
    const input = screen.getByLabelText('Width');

    // action
    fireEvent.blur(input);

    // result
    expect(onBlur).toHaveBeenCalled();
  });

  it('should not render the sizing-mode chevron when no sizing mode is given', () => {
    // before
    renderColumnDimensionsField();

    // result
    expect(screen.queryByLabelText('Width sizing options')).toBeNull();
  });

  it('should render the sizing-mode chevron when a sizing mode is given, matching the field axis', () => {
    // before
    renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.fixed });

    // result
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
  });

  it('should render the height sizing-mode chevron for a height axis field', () => {
    // before
    renderColumnDimensionsField({ axis: 'height', onSelectSizingMode: vi.fn(), sizingMode: SizingMode.fixed });

    // result
    expect(screen.getByLabelText('Height sizing options')).toBeInTheDocument();
  });

  it('should show the literal "Hug" text instead of the chevron while hugging and not hovered', () => {
    // before
    renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.hug });

    // result
    expect(screen.getByText('Hug')).toBeInTheDocument();
    expect(screen.queryByLabelText('Width sizing options')).toBeNull();
  });

  it('should swap "Hug" for the chevron once the field is hovered', () => {
    // before
    const { container } = renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.hug });

    // action
    fireEvent.mouseEnter(getFieldRoot(container));

    // result
    expect(screen.queryByText('Hug')).toBeNull();
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
  });

  it('should swap the chevron back to "Hug" once the pointer leaves the field again', () => {
    // before
    const { container } = renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.hug });
    const root = getFieldRoot(container);

    // action
    fireEvent.mouseEnter(root);
    fireEvent.mouseLeave(root);

    // result
    expect(screen.getByText('Hug')).toBeInTheDocument();
    expect(screen.queryByLabelText('Width sizing options')).toBeNull();
  });

  it('should keep the chevron visible after the pointer leaves, while its menu is still open', () => {
    // before
    const { container } = renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.hug });
    const root = getFieldRoot(container);

    // action — hover reveals the chevron, click opens its menu, then the pointer leaves
    fireEvent.mouseEnter(root);
    fireEvent.click(screen.getByLabelText('Width sizing options'));
    fireEvent.mouseLeave(root);

    // result — the menu being open keeps the chevron shown instead of reverting to "Hug"
    expect(screen.queryByText('Hug')).toBeNull();
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
  });

  it('should always show the chevron (never "Hug") while fixed, hovered or not', () => {
    // before
    const { container } = renderColumnDimensionsField({ onSelectSizingMode: vi.fn(), sizingMode: SizingMode.fixed });
    const root = getFieldRoot(container);

    // action
    fireEvent.mouseEnter(root);
    fireEvent.mouseLeave(root);

    // result
    expect(screen.queryByText('Hug')).toBeNull();
    expect(screen.getByLabelText('Width sizing options')).toBeInTheDocument();
  });
});
