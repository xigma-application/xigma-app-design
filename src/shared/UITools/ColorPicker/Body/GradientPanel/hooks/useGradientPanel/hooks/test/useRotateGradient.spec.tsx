import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useRotateGradient, TGradientPoints } from '../useRotateGradient';

// types
import { TEditableGradientStop } from '../../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

const renderUseRotateGradient = (initialPoints: TGradientPoints | null, onChange = vi.fn()) => {
  const hook = renderHook(() => {
    const [angle, setAngle] = useState(0);
    const [points, setPoints] = useState(initialPoints);

    return { angle, points, rotate: useRotateGradient(STOPS, 'gradient-linear', angle, setAngle, points, setPoints, onChange) };
  });

  return { hook, onChange };
};

describe('useRotateGradient', () => {
  it('should rotate real start/end points by 90° around the gradient center when seeded with points', () => {
    // before
    const { hook, onChange } = renderUseRotateGradient({ end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } });

    // action
    act(() => hook.result.current.rotate());

    // result
    expect(hook.result.current.points?.start.x).toBeCloseTo(0.5);
    expect(hook.result.current.points?.start.y).toBeCloseTo(0);
    expect(hook.result.current.points?.end.x).toBeCloseTo(0.5);
    expect(hook.result.current.points?.end.y).toBeCloseTo(1);
    expect(hook.result.current.angle).toBe(0);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ end: hook.result.current.points?.end, start: hook.result.current.points?.start }),
    );
  });

  it('should cycle the angle by 90 degrees, wrapping at 360, when there are no points', () => {
    // before
    const { hook } = renderUseRotateGradient(null);

    // action
    act(() => hook.result.current.rotate());
    expect(hook.result.current.angle).toBe(90);

    act(() => hook.result.current.rotate());
    act(() => hook.result.current.rotate());
    act(() => hook.result.current.rotate());

    // result
    expect(hook.result.current.angle).toBe(0);
    expect(hook.result.current.points).toBeNull();
  });
});
