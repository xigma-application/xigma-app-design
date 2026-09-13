import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useSetStopColor } from '../useSetStopColor';

// types
import { TEditableGradientStop } from '../../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

const renderUseSetStopColor = (onChange = vi.fn()) => {
  const hook = renderHook(() => {
    const [stops, setStops] = useState(STOPS);

    return { setStopColor: useSetStopColor(stops, setStops, 'gradient-linear', 0, null, onChange), stops };
  });

  return { hook, onChange };
};

describe('useSetStopColor', () => {
  it('should update the color and opacity of the given stop', () => {
    // before
    const { hook } = renderUseSetStopColor();

    // action
    act(() => hook.result.current.setStopColor('stop-1', { alpha: 40, hex: '#123456' }));

    // result
    const stop = hook.result.current.stops.find((candidate) => candidate.id === 'stop-1');

    expect(stop?.color).toBe('#123456');
    expect(stop?.opacity).toBe(40);
  });

  it('should notify onChange with the updated stops', () => {
    // before
    const { hook, onChange } = renderUseSetStopColor();

    // action
    act(() => hook.result.current.setStopColor('stop-2', { alpha: 100, hex: '#00ff00' }));

    // result
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stops: hook.result.current.stops }));
  });
});
