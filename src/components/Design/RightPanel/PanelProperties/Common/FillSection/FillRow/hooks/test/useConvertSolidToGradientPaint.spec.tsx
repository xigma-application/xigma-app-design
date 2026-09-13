import { renderHook } from '@testing-library/react';

// hooks
import { useConvertSolidToGradientPaint } from '../useConvertSolidToGradientPaint';

// types
import { TSolidPaint } from 'types/design/paint/types';

const SOLID_PAINT: TSolidPaint = { color: '#d9d9d9', opacity: 80, type: 'solid', visible: true };

describe('useConvertSolidToGradientPaint', () => {
  it('should build a real TGradientPaint with points derived from angle when the panel change has no start/end', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertSolidToGradientPaint(SOLID_PAINT, onChange));

    // action
    result.current({
      angle: 90,
      stops: [
        { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
        { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    });

    // result — preserves the solid paint's opacity/visible, angle 90 maps to a vertical line
    expect(onChange).toHaveBeenCalledWith({
      blendMode: undefined,
      end: { x: 0.5, y: 1 },
      opacity: 80,
      start: { x: 0.5, y: 0 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
      visible: true,
    });
  });

  it('should use the real start/end from the panel change when provided', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertSolidToGradientPaint(SOLID_PAINT, onChange));

    // action
    result.current({
      angle: 0,
      end: { x: 0.8, y: 0.2 },
      start: { x: 0.1, y: 0.9 },
      stops: [{ color: '#ff0000', id: 'stop-1', opacity: 100, position: 0 }],
      type: 'gradient-linear',
    });

    // result
    const paint = onChange.mock.calls[0][0];

    expect(paint.start).toEqual({ x: 0.1, y: 0.9 });
    expect(paint.end).toEqual({ x: 0.8, y: 0.2 });
  });
});
