import { fireEvent, render, screen } from '@testing-library/react';

// components
import Tabs from './Tabs';
import { TooltipProvider } from 'shared';

// types
import { TTab } from './types';

const tabs: TTab[] = [
  { labelTranslationKey: 'tabs.solid', name: 'solid' },
  { disabled: true, labelTranslationKey: 'tabs.gradient', name: 'gradient' },
];

const renderTabs = (activeTab: string, setActiveTab: TFunc<[string]>): ReturnType<typeof render> =>
  render(
    <TooltipProvider>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
    </TooltipProvider>,
  );

describe('Tabs snapshots', () => {
  it('should render Tabs', () => {
    // before
    const { asFragment } = renderTabs('solid', vi.fn());

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('Tabs behaviors', () => {
  it('should call setActiveTab with the clicked tab name', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    renderTabs('solid', setActiveTab);

    // action
    fireEvent.click(screen.getByText('tabs.solid'));

    // result
    expect(setActiveTab).toHaveBeenCalledWith('solid');
  });

  it('should not call setActiveTab when clicking a disabled tab', () => {
    // mock
    const setActiveTab = vi.fn();

    // before
    renderTabs('solid', setActiveTab);

    // action
    fireEvent.click(screen.getByText('tabs.gradient'));

    // result
    expect(setActiveTab).not.toHaveBeenCalled();
  });
});
