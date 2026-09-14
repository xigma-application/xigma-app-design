import { act, renderHook, RenderHookResult } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useResetGradientPanel } from '../useResetGradientPanel';

// others
import { DEFAULT_GRADIENT_STOPS, DEFAULT_GRADIENT_TYPE } from '../../../../constants';

// types
import { TEditableGradientStop, TGradientType } from '../../../../types';
import { TGradientPoints } from '../useRotateGradient';

const STUB_STOPS: TEditableGradientStop[] = [{ color: '#111111', id: 'existing', opacity: 100, position: 0.5 }];

type TResult = {
  angle: number;
  points: TGradientPoints | null;
  reset: TFunc;
  selectedStopId: string | null;
  stops: TEditableGradientStop[];
  type: TGradientType;
};

const renderUseResetGradientPanel = (): RenderHookResult<TResult, unknown> =>
  renderHook(() => {
    const [stops, setStops] = useState<TEditableGradientStop[]>(STUB_STOPS);
    const [selectedStopId, setSelectedStopId] = useState<string | null>('existing');
    const [angle, setAngle] = useState(90);
    const [points, setPoints] = useState<TGradientPoints | null>({ end: { x: 1, y: 1 }, start: { x: 0, y: 0 } });
    const [type, setType] = useState<TGradientType>('gradient-radial');
    const reset = useResetGradientPanel(setStops, setSelectedStopId, setAngle, setPoints, setType);

    return { angle, points, reset, selectedStopId, stops, type };
  });

describe('useResetGradientPanel', () => {
  it('should not reset anything until called', () => {
    // before
    const { result } = renderUseResetGradientPanel();

    // result
    expect(result.current.stops).toEqual(STUB_STOPS);
    expect(result.current.type).toBe('gradient-radial');
  });

  it('should reset stops, selection, angle, points, and type to the plain defaults when called', () => {
    // before
    const { result } = renderUseResetGradientPanel();

    // action
    act(() => result.current.reset());

    // result
    expect(result.current.stops).toEqual(DEFAULT_GRADIENT_STOPS);
    expect(result.current.selectedStopId).toBeNull();
    expect(result.current.angle).toBe(0);
    expect(result.current.points).toBeNull();
    expect(result.current.type).toBe(DEFAULT_GRADIENT_TYPE);
  });
});
