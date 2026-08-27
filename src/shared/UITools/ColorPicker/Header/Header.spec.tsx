import * as PopoverPrimitive from '@radix-ui/react-popover';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import Header from './Header';
import { TooltipProvider } from 'shared';

// types
import { ColorPickerTab } from '../enums';

const renderHeader = (
  activeTab: ColorPickerTab,
  setActiveTab: TFunc<[string]>,
  onOpenChange?: TFunc<[boolean]>,
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PopoverPrimitive.Root onOpenChange={onOpenChange} open>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      </PopoverPrimitive.Root>
    </TooltipProvider>,
  );

describe('Header snapshots', () => {
  it('should render Header', () => {
    // before
    const { asFragment } = renderHeader(ColorPickerTab.solid, vi.fn());

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Header behaviors', () => {
  it('should call setActiveTab when clicking the solid tab', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    renderHeader(ColorPickerTab.gradient, setActiveTab);

    // action
    fireEvent.click(screen.getByText('Solid'));

    // result
    expect(setActiveTab).toHaveBeenCalledWith(ColorPickerTab.solid);
  });

  it('should not call setActiveTab when clicking the disabled gradient tab', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    renderHeader(ColorPickerTab.solid, setActiveTab);

    // action
    fireEvent.click(screen.getByText('Gradient'));

    // result
    expect(setActiveTab).not.toHaveBeenCalled();
  });

  it('should close the panel when the close button is clicked', () => {
    // mock
    const onOpenChange = vi.fn();

    // before
    renderHeader(ColorPickerTab.solid, vi.fn(), onOpenChange);

    // action
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    // result
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
