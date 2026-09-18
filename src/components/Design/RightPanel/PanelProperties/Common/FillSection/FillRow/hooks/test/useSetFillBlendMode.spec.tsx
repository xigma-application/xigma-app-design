import { renderHook } from '@testing-library/react';

// hooks
import { useSetFillBlendMode } from '../useSetFillBlendMode';

// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

const SOLID_PAINT: TPaint = { color: '#ff0000', opacity: 80, type: 'solid' };

describe('useSetFillBlendMode', () => {
  it('should commit the paint with the new blend mode, preserving the rest of it', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useSetFillBlendMode(SOLID_PAINT, onChange));

    // action
    result.current(BlendMode.multiply);

    // result
    expect(onChange).toHaveBeenCalledWith({ ...SOLID_PAINT, blendMode: BlendMode.multiply });
  });
});
