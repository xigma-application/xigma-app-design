import * as PopoverPrimitive from '@radix-ui/react-popover';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import DropdownPanel from './DropdownPanel';

const options = [
  { label: 'Hex', value: 'hex' },
  { label: 'RGB', value: 'rgb' },
];

const renderDropdownPanel = (
  onSelect: TFunc<[string]>,
  onHighlight: TFunc<[number]> = vi.fn(),
  highlightedIndex = 0,
): ReturnType<typeof render> =>
  render(
    <PopoverPrimitive.Root open>
      <DropdownPanel highlightedIndex={highlightedIndex} onHighlight={onHighlight} onSelect={onSelect} options={options} value="hex" />
    </PopoverPrimitive.Root>,
  );

describe('DropdownPanel snapshots', () => {
  it('should render DropdownPanel with one item per option', () => {
    // before
    const { asFragment } = renderDropdownPanel(vi.fn());

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('DropdownPanel behaviors', () => {
  it('should call onSelect with the clicked option value', () => {
    // mock
    const onSelect = vi.fn();

    // before
    renderDropdownPanel(onSelect);

    // action
    fireEvent.click(screen.getByText('RGB'));

    // result
    expect(onSelect).toHaveBeenCalledWith('rgb');
  });

  it('should call onHighlight with the hovered option index', () => {
    // mock
    const onHighlight = vi.fn();

    // before
    renderDropdownPanel(vi.fn(), onHighlight);

    // action
    fireEvent.mouseEnter(screen.getByText('RGB'));

    // result
    expect(onHighlight).toHaveBeenCalledWith(1);
  });
});

describe('DropdownPanel separator', () => {
  it('should render a separator before an option marked with separatorBefore', () => {
    // before
    const { container } = render(
      <PopoverPrimitive.Root open>
        <DropdownPanel
          highlightedIndex={0}
          onHighlight={vi.fn()}
          onSelect={vi.fn()}
          options={[
            { label: 'Solid', value: 'solid' },
            { label: 'Custom', separatorBefore: true, value: 'custom' },
          ]}
          value="solid"
        />
      </PopoverPrimitive.Root>,
    );

    // result
    expect(container.querySelectorAll('[class*="DropdownPanel__separator"]')).toHaveLength(1);
  });
});

describe('DropdownPanel width', () => {
  it('should apply menuWidth as the panel width', () => {
    // before
    const { container } = render(
      <PopoverPrimitive.Root open>
        <DropdownPanel highlightedIndex={0} menuWidth={144} onHighlight={vi.fn()} onSelect={vi.fn()} options={options} value="hex" />
      </PopoverPrimitive.Root>,
    );

    // result
    expect((container.querySelector('[class*="DropdownPanel"]') as HTMLElement).style.width).toBe('144px');
  });
});

describe('DropdownPanel max height', () => {
  it('should make the panel scrollable up to menuMaxHeight', () => {
    // before
    const { container } = render(
      <PopoverPrimitive.Root open>
        <DropdownPanel highlightedIndex={0} menuMaxHeight={200} onHighlight={vi.fn()} onSelect={vi.fn()} options={options} value="hex" />
      </PopoverPrimitive.Root>,
    );
    const panel = container.querySelector('[class*="DropdownPanel"]') as HTMLElement;

    // result
    expect(panel.style.maxHeight).toBe('200px');
    expect(panel.style.overflowY).toBe('auto');
  });
});
