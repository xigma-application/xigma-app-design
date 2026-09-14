import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useSetGradientType } from '../useSetGradientType';
import { TGradientPoints } from '../useRotateGradient';

// types
import { TEditableGradientStop, TGradientType } from '../../../../types';

const STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-1', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-2', opacity: 100, position: 1 },
];

const renderSetGradientType = (
  onChange: TFunc<[unknown]>,
): ReturnType<typeof renderHook<{ points: TGradientPoints | null; setGradientType: TFunc<[TGradientType]>; type: TGradientType }, unknown>> =>
  renderHook(() => {
    const [type, setType] = useState<TGradientType>('gradient-linear');
    const [points, setPoints] = useState<TGradientPoints | null>({ end: { x: 1, y: 1 }, start: { x: 0, y: 0 } });

    return { points, setGradientType: useSetGradientType(setType, setPoints, STOPS, onChange), type };
  });

describe('useSetGradientType', () => {
  it('should update the type and notify onChange with the current stops and the new type', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderSetGradientType(onChange);

    // action
    act(() => result.current.setGradientType('gradient-radial'));

    // result
    expect(result.current.type).toBe('gradient-radial');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ stops: STOPS, type: 'gradient-radial' }));
  });

  it('should reset the points to a centered radius reaching the bottom edge when switching to radial', () => {
    // mock
    const onChange = vi.fn();

    // before — points start out as an unrelated diagonal line, simulating a prior gradient's state
    const { result } = renderSetGradientType(onChange);

    // action
    act(() => result.current.setGradientType('gradient-radial'));

    // result
    expect(result.current.points).toEqual({ end: { x: 0.5, y: 1 }, start: { x: 0.5, y: 0.5 } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ end: { x: 0.5, y: 1 }, start: { x: 0.5, y: 0.5 } }));
  });

  it('should reset the points to the default horizontal line when switching to a non-radial type', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderSetGradientType(onChange);

    // action
    act(() => result.current.setGradientType('gradient-angular'));

    // result
    expect(result.current.points).toEqual({ end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } }));
  });
});
