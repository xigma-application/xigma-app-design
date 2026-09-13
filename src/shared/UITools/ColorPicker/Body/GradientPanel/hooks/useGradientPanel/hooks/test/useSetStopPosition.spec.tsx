import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useSetStopPosition } from '../useSetStopPosition';

// types
import { TEditableGradientStop } from '../../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

const renderUseSetStopPosition = (onChange = vi.fn()) => {
  const hook = renderHook(() => {
    const [stops, setStops] = useState(STOPS);

    return { setStopPosition: useSetStopPosition(stops, setStops, 'gradient-linear', 0, null, onChange), stops };
  });

  return { hook, onChange };
};

describe('useSetStopPosition', () => {
  it('should move a stop to the new position and keep the list sorted', () => {
    // before
    const { hook } = renderUseSetStopPosition();

    // action
    act(() => hook.result.current.setStopPosition('stop-1', 0.9));

    // result
    expect(hook.result.current.stops.map((stop) => stop.position)).toEqual([0.9, 1]);
  });

  it('should notify onChange with the updated stops', () => {
    // before
    const { hook, onChange } = renderUseSetStopPosition();

    // action
    act(() => hook.result.current.setStopPosition('stop-1', 0.3));

    // result
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stops: hook.result.current.stops }));
  });
});
