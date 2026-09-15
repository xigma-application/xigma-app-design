import { act, renderHook, RenderHookResult } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useAddStop } from '../useAddStop';

// types
import { TEditableGradientStop } from '../../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

type TResult = { addStop: TFunc<[number]>; stops: TEditableGradientStop[] };

const renderUseAddStop = (
  onChange = vi.fn(),
  initialStops = STOPS,
): { hook: RenderHookResult<TResult, unknown>; onChange: ReturnType<typeof vi.fn>; selectStop: ReturnType<typeof vi.fn> } => {
  const selectStop = vi.fn();
  const hook = renderHook(() => {
    const [stops, setStops] = useState(initialStops);

    return { addStop: useAddStop(stops, setStops, selectStop, 'gradient-linear', 0, null, onChange), stops };
  });

  return { hook, onChange, selectStop };
};

describe('useAddStop', () => {
  it('should insert a stop inheriting the nearest neighbor color, keeping the list sorted', () => {
    // before
    const { hook } = renderUseAddStop();

    // action
    act(() => hook.result.current.addStop(0.9));

    // result
    expect(hook.result.current.stops.map((stop) => stop.position)).toEqual([0, 0.9, 1]);
    expect(hook.result.current.stops[1].color).toBe('#000000');
  });

  it('should select the newly added stop and notify onChange with the updated stops', () => {
    // before
    const { hook, onChange, selectStop } = renderUseAddStop();

    // action
    act(() => hook.result.current.addStop(0.5));

    // result
    expect(selectStop).toHaveBeenCalledWith(hook.result.current.stops[1].id);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ angle: 0, stops: hook.result.current.stops, type: 'gradient-linear' }));
  });

  it('should do nothing once the max stop count is reached', () => {
    // before
    const eightStops = Array.from({ length: 8 }, (_stop, index) => ({
      color: '#ffffff',
      id: `stop-${index}`,
      opacity: 100,
      position: index / 7,
    }));
    const { hook, onChange } = renderUseAddStop(vi.fn(), eightStops);

    // action
    act(() => hook.result.current.addStop(0.5));

    // result
    expect(hook.result.current.stops).toHaveLength(8);
    expect(onChange).not.toHaveBeenCalled();
  });
});
