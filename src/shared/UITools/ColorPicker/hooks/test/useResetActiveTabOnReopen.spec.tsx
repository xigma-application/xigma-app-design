import { renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useResetActiveTabOnReopen } from '../useResetActiveTabOnReopen';

// types
import { ColorPickerTab } from '../../enums';

type TProps = { initialActiveTab: ColorPickerTab | undefined; openSessionId: number };

const renderUseResetActiveTabOnReopen = (initialActiveTab: ColorPickerTab | undefined, openSessionId: number) =>
  renderHook(
    ({ initialActiveTab: initial, openSessionId: sessionId }: TProps) => {
      const [activeTab, setActiveTab] = useState(ColorPickerTab.gradient);

      useResetActiveTabOnReopen(sessionId, initial, ColorPickerTab.solid, setActiveTab);

      return activeTab;
    },
    { initialProps: { initialActiveTab, openSessionId } },
  );

describe('useResetActiveTabOnReopen', () => {
  it('should not touch activeTab on the first render, even when openSessionId is already defined', () => {
    // before
    const { result } = renderUseResetActiveTabOnReopen(ColorPickerTab.solid, 1);

    // result
    expect(result.current).toBe(ColorPickerTab.gradient);
  });

  it('should reset to the default active tab when openSessionId changes and there is no initialActiveTab', () => {
    // before
    const { rerender, result } = renderUseResetActiveTabOnReopen(undefined, 1);

    // action
    rerender({ initialActiveTab: undefined, openSessionId: 2 });

    // result
    expect(result.current).toBe(ColorPickerTab.solid);
  });

  it('should reset to the latest initialActiveTab when openSessionId changes', () => {
    // before
    const { rerender, result } = renderUseResetActiveTabOnReopen(ColorPickerTab.solid, 1);

    // action — initialActiveTab flips to gradient before the reopen
    rerender({ initialActiveTab: ColorPickerTab.gradient, openSessionId: 2 });

    // result
    expect(result.current).toBe(ColorPickerTab.gradient);
  });

  it('should not reset when re-rendering without a new openSessionId', () => {
    // before
    const { rerender, result } = renderUseResetActiveTabOnReopen(ColorPickerTab.solid, 1);

    // action
    rerender({ initialActiveTab: ColorPickerTab.solid, openSessionId: 1 });

    // result — untouched, still whatever the panel had set it to
    expect(result.current).toBe(ColorPickerTab.gradient);
  });
});
