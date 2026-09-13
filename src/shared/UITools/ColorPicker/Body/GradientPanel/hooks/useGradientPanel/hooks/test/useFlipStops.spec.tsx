import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useFlipStops } from '../useFlipStops';

// types
import { TEditableGradientStop } from '../../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

const renderUseFlipStops = (onChange = vi.fn()) => {
  const hook = renderHook(() => {
    const [stops, setStops] = useState(STOPS);

    return { flip: useFlipStops(stops, setStops, 'gradient-linear', 0, null, onChange), stops };
  });

  return { hook, onChange };
};

describe('useFlipStops', () => {
  it('should mirror stop positions and colors', () => {
    // before
    const { hook } = renderUseFlipStops();

    // action
    act(() => hook.result.current.flip());

    // result
    expect(hook.result.current.stops[0]).toMatchObject({ color: '#000000', position: 0 });
    expect(hook.result.current.stops[1]).toMatchObject({ color: '#ffffff', position: 1 });
  });

  it('should notify onChange with the flipped stops', () => {
    // before
    const { hook, onChange } = renderUseFlipStops();

    // action
    act(() => hook.result.current.flip());

    // result
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stops: hook.result.current.stops }));
  });
});
