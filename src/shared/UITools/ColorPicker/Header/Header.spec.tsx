import * as PopoverPrimitive from '@radix-ui/react-popover';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

// components
import Header from './Header';
import { TooltipProvider } from 'shared';

// others
import { CUSTOM_LIBRARY_TABS } from './constants';

// types
import { ColorPickerTab } from '../enums';
import { TTab } from 'shared/UITools/Tabs/types';

const renderHeader = (
  activeTab: ColorPickerTab,
  setActiveTab: TFunc<[string]>,
  onOpenChange?: TFunc<[boolean]>,
  extra?: ReactNode,
  tabs?: TTab[],
  title?: string,
): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <PopoverPrimitive.Root onOpenChange={onOpenChange} open>
        <Header activeTab={activeTab} extra={extra} setActiveTab={setActiveTab} tabs={tabs} title={title} />
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

  it('should call setActiveTab when clicking the gradient tab', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    renderHeader(ColorPickerTab.solid, setActiveTab);

    // action
    fireEvent.click(screen.getByText('Gradient'));

    // result
    expect(setActiveTab).toHaveBeenCalledWith(ColorPickerTab.gradient);
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

  it('should render the extra slot next to the close button', () => {
    // before
    renderHeader(ColorPickerTab.solid, vi.fn(), vi.fn(), <button type="button">Extra</button>);

    // result
    expect(screen.getByText('Extra')).toBeInTheDocument();
  });

  it('should render the Custom/Libraries tabs instead of Solid/Gradient when tabs is overridden', () => {
    // before
    renderHeader(ColorPickerTab.solid, vi.fn(), undefined, undefined, CUSTOM_LIBRARY_TABS);

    // result
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Libraries')).toBeInTheDocument();
    expect(screen.queryByText('Solid')).not.toBeInTheDocument();
    expect(screen.queryByText('Gradient')).not.toBeInTheDocument();
  });

  it('should not call setActiveTab when clicking the disabled Libraries tab', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    renderHeader(ColorPickerTab.solid, setActiveTab, undefined, undefined, CUSTOM_LIBRARY_TABS);

    // action
    fireEvent.click(screen.getByText('Libraries'));

    // result
    expect(setActiveTab).not.toHaveBeenCalled();
  });

  it('should render a plain title label instead of any tabs when title is set', () => {
    // before
    renderHeader(ColorPickerTab.solid, vi.fn(), undefined, undefined, undefined, 'Custom');

    // result
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.queryByText('Solid')).not.toBeInTheDocument();
    expect(screen.queryByText('Gradient')).not.toBeInTheDocument();
  });
});
