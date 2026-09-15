import { renderHook } from '@testing-library/react';

// hooks
import { useConvertSolidToGradientPaint } from '../useConvertSolidToGradientPaint';

// types
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';

const SOLID_PAINT: TSolidPaint = { color: '#d9d9d9', opacity: 80, type: 'solid', visible: true };

const RADIAL_PAINT: TGradientPaint = {
  end: { x: 1, y: 0.5 },
  opacity: 100,
  radiusRatio: 0.4,
  start: { x: 0, y: 0.5 },
  stops: [{ color: '#ffffff', opacity: 100, position: 0 }],
  type: 'gradient-radial',
};

const ANGULAR_PAINT: TGradientPaint = {
  end: { x: 0.5, y: 1 },
  opacity: 100,
  radiusRatio: 0.6,
  start: { x: 0.5, y: 0.5 },
  stops: [{ color: '#ffffff', opacity: 100, position: 0 }],
  type: 'gradient-angular',
};

const DIAMOND_PAINT: TGradientPaint = {
  end: { x: 0.5, y: 1 },
  opacity: 100,
  radiusRatio: 0.7,
  start: { x: 0.5, y: 0.5 },
  stops: [{ color: '#ffffff', opacity: 100, position: 0 }],
  type: 'gradient-diamond',
};

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

  it('should default radiusRatio to 1 when switching to radial from a non-radial paint', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertSolidToGradientPaint(SOLID_PAINT, onChange));

    // action
    result.current({
      angle: 0,
      stops: [{ color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 }],
      type: 'gradient-radial',
    });

    // result
    expect(onChange.mock.calls[0][0].radiusRatio).toBe(1);
  });

  it('should default radiusRatio to 1 when the paint is already radial but has none set yet', () => {
    // mock
    const onChange = vi.fn();
    const radialPaintWithoutRatio: TGradientPaint = { ...RADIAL_PAINT, radiusRatio: undefined };

    // before
    const { result } = renderHook(() => useConvertSolidToGradientPaint(radialPaintWithoutRatio, onChange));

    // action
    result.current({
      angle: 0,
      end: RADIAL_PAINT.end,
      start: RADIAL_PAINT.start,
      stops: [{ color: '#ff0000', id: 'stop-1', opacity: 100, position: 0 }],
      type: 'gradient-radial',
    });

    // result
    expect(onChange.mock.calls[0][0].radiusRatio).toBe(1);
  });

  it('should preserve the existing radiusRatio when the paint is already radial', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertSolidToGradientPaint(RADIAL_PAINT, onChange));

    // action — editing a stop color, not touching the type
    result.current({
      angle: 0,
      end: RADIAL_PAINT.end,
      start: RADIAL_PAINT.start,
      stops: [{ color: '#ff0000', id: 'stop-1', opacity: 100, position: 0 }],
      type: 'gradient-radial',
    });

    // result
    expect(onChange.mock.calls[0][0].radiusRatio).toBe(0.4);
  });

  it('should preserve the existing radiusRatio when the paint is already angular, e.g. while editing a stop color', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertSolidToGradientPaint(ANGULAR_PAINT, onChange));

    // action — editing a stop color, not touching the type or the radius handle
    result.current({
      angle: 0,
      end: ANGULAR_PAINT.end,
      start: ANGULAR_PAINT.start,
      stops: [{ color: '#ff0000', id: 'stop-1', opacity: 100, position: 0 }],
      type: 'gradient-angular',
    });

    // result
    expect(onChange.mock.calls[0][0].radiusRatio).toBe(0.6);
  });

  it('should preserve the existing radiusRatio when the paint is already diamond, e.g. while editing a stop color', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertSolidToGradientPaint(DIAMOND_PAINT, onChange));

    // action — editing a stop color, not touching the type or the radius handle
    result.current({
      angle: 0,
      end: DIAMOND_PAINT.end,
      start: DIAMOND_PAINT.start,
      stops: [{ color: '#ff0000', id: 'stop-1', opacity: 100, position: 0 }],
      type: 'gradient-diamond',
    });

    // result
    expect(onChange.mock.calls[0][0].radiusRatio).toBe(0.7);
  });

  it('should omit radiusRatio when the resulting type is not radial', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useConvertSolidToGradientPaint(RADIAL_PAINT, onChange));

    // action — switching away from radial
    result.current({
      angle: 0,
      end: RADIAL_PAINT.end,
      start: RADIAL_PAINT.start,
      stops: [{ color: '#ff0000', id: 'stop-1', opacity: 100, position: 0 }],
      type: 'gradient-linear',
    });

    // result
    expect(onChange.mock.calls[0][0].radiusRatio).toBeUndefined();
  });
});
