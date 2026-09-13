import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useSetGradientType } from '../useSetGradientType';

// types
import { TEditableGradientStop, TGradientType } from '../../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

describe('useSetGradientType', () => {
  it('should update the type and notify onChange with the current stops and the new type', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => {
      const [type, setType] = useState<TGradientType>('gradient-linear');

      return { setGradientType: useSetGradientType(setType, STOPS, 0, null, onChange), type };
    });

    // action
    act(() => result.current.setGradientType('gradient-radial'));

    // result
    expect(result.current.type).toBe('gradient-radial');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stops: STOPS, type: 'gradient-radial' }));
  });
});
