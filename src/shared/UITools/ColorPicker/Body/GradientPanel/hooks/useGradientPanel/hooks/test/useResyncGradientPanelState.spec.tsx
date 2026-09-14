import { act, renderHook, RenderHookResult } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useResyncGradientPanelState } from '../useResyncGradientPanelState';

// others
import { DEFAULT_GRADIENT_STOPS, DEFAULT_GRADIENT_TYPE } from '../../../../constants';

// types
import { TEditableGradientStop, TGradientType, TInitialGradient } from '../../../../types';
import { TGradientPoints } from '../useRotateGradient';

const STUB_STOPS: TEditableGradientStop[] = [{ color: '#111111', id: 'existing', opacity: 100, position: 0.5 }];

type TProps = { initialGradient: TInitialGradient | undefined; resetKey: number | undefined };
type TResult = {
  angle: number;
  points: TGradientPoints | null;
  selectedStopId: string | null;
  stops: TEditableGradientStop[];
  type: TGradientType;
};

const renderUseResyncGradientPanelState = (
  initialGradient: TInitialGradient | undefined,
  resetKey: number | undefined,
): RenderHookResult<TResult, TProps> =>
  renderHook(
    ({ initialGradient: gradient, resetKey: key }: TProps) => {
      const [stops, setStops] = useState<TEditableGradientStop[]>(STUB_STOPS);
      const [selectedStopId, setSelectedStopId] = useState<string | null>('existing');
      const [angle, setAngle] = useState(90);
      const [points, setPoints] = useState<TGradientPoints | null>({ end: { x: 1, y: 1 }, start: { x: 0, y: 0 } });
      const [type, setType] = useState<TGradientType>('gradient-radial');

      useResyncGradientPanelState(key, gradient, setStops, setSelectedStopId, setAngle, setPoints, setType);

      return { angle, points, selectedStopId, stops, type };
    },
    { initialProps: { initialGradient, resetKey } },
  );

describe('useResyncGradientPanelState', () => {
  it('should do nothing on the first render, even when resetKey is already defined', () => {
    // before
    const { result } = renderUseResyncGradientPanelState(undefined, 1);

    // result
    expect(result.current.stops).toEqual(STUB_STOPS);
    expect(result.current.type).toBe('gradient-radial');
  });

  it('should reset to defaults when resetKey changes and there is no initialGradient', () => {
    // before
    const { rerender, result } = renderUseResyncGradientPanelState(undefined, 1);

    // action
    act(() => rerender({ initialGradient: undefined, resetKey: 2 }));

    // result
    expect(result.current.stops).toEqual(DEFAULT_GRADIENT_STOPS);
    expect(result.current.selectedStopId).toBeNull();
    expect(result.current.angle).toBe(0);
    expect(result.current.points).toBeNull();
    expect(result.current.type).toBe(DEFAULT_GRADIENT_TYPE);
  });

  it('should seed stops, points, and type from the initialGradient when resetKey changes', () => {
    // mock
    const initialGradient: TInitialGradient = {
      end: { x: 1, y: 0 },
      start: { x: 0, y: 1 },
      stops: [{ color: '#ff0000', opacity: 100, position: 0 }],
      type: 'gradient-angular',
    };

    // before
    const { rerender, result } = renderUseResyncGradientPanelState(initialGradient, 1);

    // action
    act(() => rerender({ initialGradient, resetKey: 2 }));

    // result — the paint's own type must be reflected too, not always reset to the default (linear)
    expect(result.current.stops).toHaveLength(1);
    expect(result.current.stops[0]).toEqual(expect.objectContaining({ color: '#ff0000', opacity: 100, position: 0 }));
    expect(result.current.stops[0].id).toBeTruthy();
    expect(result.current.points).toEqual({ end: { x: 1, y: 0 }, start: { x: 0, y: 1 } });
    expect(result.current.type).toBe('gradient-angular');
  });

  it('should not reset again when resetKey stays the same across a rerender', () => {
    // before
    const { rerender, result } = renderUseResyncGradientPanelState(undefined, 1);

    // action
    act(() => rerender({ initialGradient: undefined, resetKey: 1 }));

    // result
    expect(result.current.stops).toEqual(STUB_STOPS);
  });
});
