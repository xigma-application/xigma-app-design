import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';

// hooks
import { useSyncExternalStopChanges } from '../useSyncExternalStopChanges';

// types
import { TEditableGradientStop, TInitialGradient } from '../../../../types';

const STUB_STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'stop-a', opacity: 100, position: 0 },
  { color: '#000000', id: 'stop-b', opacity: 100, position: 1 },
];

type TProps = { initialGradient: TInitialGradient | undefined };

const renderUseSyncExternalStopChanges = (initialGradient: TInitialGradient | undefined) =>
  renderHook(
    ({ initialGradient: gradient }: TProps) => {
      const [stops, setStops] = useState<TEditableGradientStop[]>(STUB_STOPS);
      const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

      useSyncExternalStopChanges(gradient, stops, setStops, setSelectedStopId);

      return { selectedStopId, stops };
    },
    { initialProps: { initialGradient } },
  );

const gradientWithStops = (stops: { color: string; opacity: number; position: number }[]): TInitialGradient => ({
  end: { x: 1, y: 0.5 },
  start: { x: 0, y: 0.5 },
  stops,
  type: 'gradient-linear',
});

describe('useSyncExternalStopChanges', () => {
  it('should do nothing when there is no initialGradient', () => {
    // before
    const { result } = renderUseSyncExternalStopChanges(undefined);

    // result
    expect(result.current.stops).toEqual(STUB_STOPS);
  });

  it('should do nothing when the stop count already matches', () => {
    // before
    const { rerender, result } = renderUseSyncExternalStopChanges(
      gradientWithStops([
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ]),
    );

    // action
    act(() =>
      rerender({
        initialGradient: gradientWithStops([
          { color: '#ffffff', opacity: 100, position: 0 },
          { color: '#000000', opacity: 100, position: 1 },
        ]),
      }),
    );

    // result — same objects, not replaced
    expect(result.current.stops).toBe(STUB_STOPS);
  });

  it('should add a stop that appeared externally (e.g. added via the canvas), preserving existing ids and selecting the new one', () => {
    // mock — a red stop inserted at 0.5, between the two existing stops
    const grownGradient = gradientWithStops([
      { color: '#ffffff', opacity: 100, position: 0 },
      { color: '#ff0000', opacity: 100, position: 0.5 },
      { color: '#000000', opacity: 100, position: 1 },
    ]);

    // before
    const { rerender, result } = renderUseSyncExternalStopChanges(
      gradientWithStops([
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ]),
    );

    // action
    act(() => rerender({ initialGradient: grownGradient }));

    // result — the two pre-existing stops keep their original local ids
    expect(result.current.stops).toHaveLength(3);
    expect(result.current.stops[0]).toBe(STUB_STOPS[0]);
    expect(result.current.stops[2]).toBe(STUB_STOPS[1]);

    // the new red stop gets a fresh id and becomes selected
    const newStop = result.current.stops[1];

    expect(newStop).toMatchObject({ color: '#ff0000', opacity: 100, position: 0.5 });
    expect(newStop.id).toBeTruthy();
    expect(result.current.selectedStopId).toBe(newStop.id);
  });

  it('should reconcile a stop removed externally without selecting anything new', () => {
    // before
    const { rerender, result } = renderUseSyncExternalStopChanges(
      gradientWithStops([
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ]),
    );

    // action
    act(() => rerender({ initialGradient: gradientWithStops([{ color: '#ffffff', opacity: 100, position: 0 }]) }));

    // result
    expect(result.current.stops).toHaveLength(1);
    expect(result.current.stops[0]).toBe(STUB_STOPS[0]);
    expect(result.current.selectedStopId).toBeNull();
  });
});
