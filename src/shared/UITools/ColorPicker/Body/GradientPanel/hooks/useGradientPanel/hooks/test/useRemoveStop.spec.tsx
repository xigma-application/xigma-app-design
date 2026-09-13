import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useRemoveStop } from '../useRemoveStop';

// types
import { TEditableGradientStop } from '../../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#888888', id: 'stop-2', opacity: 100, position: 0.5 },
  { color: '#000000', id: 'stop-3', opacity: 100, position: 1 },
];

const renderUseRemoveStop = (onChange = vi.fn(), initialStops = STOPS, initialSelectedId: string | null = null) => {
  const hook = renderHook(() => {
    const [stops, setStops] = useState(initialStops);
    const [selectedStopId, setSelectedStopId] = useState(initialSelectedId);

    return {
      removeStop: useRemoveStop(stops, setStops, selectedStopId, setSelectedStopId, 'gradient-linear', 0, null, onChange),
      selectedStopId,
      stops,
    };
  });

  return { hook, onChange };
};

describe('useRemoveStop', () => {
  it('should remove the given stop and notify onChange with the remaining stops', () => {
    // before
    const { hook, onChange } = renderUseRemoveStop();

    // action
    act(() => hook.result.current.removeStop('stop-2'));

    // result
    expect(hook.result.current.stops.map((stop) => stop.id)).toEqual(['stop-1', 'stop-3']);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stops: hook.result.current.stops }));
  });

  it('should clear the selection when removing the selected stop', () => {
    // before
    const { hook } = renderUseRemoveStop(vi.fn(), STOPS, 'stop-2');

    // action
    act(() => hook.result.current.removeStop('stop-2'));

    // result
    expect(hook.result.current.selectedStopId).toBeNull();
  });

  it('should leave an unrelated selection untouched', () => {
    // before
    const { hook } = renderUseRemoveStop(vi.fn(), STOPS, 'stop-1');

    // action
    act(() => hook.result.current.removeStop('stop-2'));

    // result
    expect(hook.result.current.selectedStopId).toBe('stop-1');
  });

  it('should do nothing at the minimum stop count', () => {
    // before
    const twoStops = STOPS.slice(0, 2);
    const { hook, onChange } = renderUseRemoveStop(vi.fn(), twoStops);

    // action
    act(() => hook.result.current.removeStop('stop-1'));

    // result
    expect(hook.result.current.stops).toHaveLength(2);
    expect(onChange).not.toHaveBeenCalled();
  });
});
