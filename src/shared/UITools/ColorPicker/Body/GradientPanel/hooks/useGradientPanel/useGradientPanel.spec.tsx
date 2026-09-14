import { act, renderHook } from '@testing-library/react';

// hooks
import { useGradientPanel } from './useGradientPanel';

describe('useGradientPanel', () => {
  it('should default to two stops and none selected', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    // result
    expect(result.current.stops).toHaveLength(2);
    expect(result.current.selectedStopId).toBeNull();
    expect(result.current.canRemoveStop).toBe(false);
    expect(result.current.angle).toBe(0);
    expect(result.current.type).toBe('gradient-linear');
  });

  it('should change the gradient type', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    // action
    act(() => result.current.setType('gradient-radial'));

    // result
    expect(result.current.type).toBe('gradient-radial');
  });

  it('should select a stop', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());
    const firstStopId = result.current.stops[0].id;

    // action
    act(() => result.current.selectStop(firstStopId));

    // result
    expect(result.current.selectedStopId).toBe(firstStopId);
  });

  it('should add a stop inheriting the color of the nearest existing stop, and select it', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    // action
    act(() => result.current.addStop(0.1));

    // result
    expect(result.current.stops).toHaveLength(3);

    const added = result.current.stops.find((stop) => stop.position === 0.1);

    expect(added?.color).toBe('#d9d9d9');
    expect(result.current.selectedStopId).toBe(added?.id);
    expect(result.current.canRemoveStop).toBe(true);
  });

  it('should inherit the color of the closer stop when adding one nearer to the second stop', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    // action
    act(() => result.current.addStop(0.9));

    // result
    const added = result.current.stops.find((stop) => stop.position === 0.9);

    expect(added?.color).toBe('#737373');
  });

  it('should keep stops ordered by position after adding one in the middle', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    // action
    act(() => result.current.addStop(0.5));

    // result
    expect(result.current.stops.map((stop) => stop.position)).toEqual([0, 0.5, 1]);
  });

  it('should not remove a stop when only the minimum remain', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    // action
    act(() => result.current.removeStop(result.current.stops[0].id));

    // result
    expect(result.current.stops).toHaveLength(2);
  });

  it('should remove a stop once above the minimum, clearing its selection', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    act(() => result.current.addStop(0.5));
    const middleStopId = result.current.stops[1].id;

    act(() => result.current.selectStop(middleStopId));

    // action
    act(() => result.current.removeStop(middleStopId));

    // result
    expect(result.current.stops).toHaveLength(2);
    expect(result.current.selectedStopId).toBeNull();
  });

  it('should remove a stop without touching an unrelated selection', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    act(() => result.current.addStop(0.5));
    const firstStopId = result.current.stops[0].id;
    const middleStopId = result.current.stops[1].id;

    act(() => result.current.selectStop(firstStopId));

    // action
    act(() => result.current.removeStop(middleStopId));

    // result
    expect(result.current.stops).toHaveLength(2);
    expect(result.current.selectedStopId).toBe(firstStopId);
  });

  it('should move a stop to a new position and keep the list sorted', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());
    const firstStopId = result.current.stops[0].id;

    // action
    act(() => result.current.setStopPosition(firstStopId, 0.9));

    // result
    expect(result.current.stops.map((stop) => stop.position)).toEqual([0.9, 1]);
  });

  it('should update a stop color and opacity', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());
    const firstStopId = result.current.stops[0].id;

    // action
    act(() => result.current.setStopColor(firstStopId, { alpha: 40, hex: '#123456' }));

    // result
    const stop = result.current.stops.find((candidate) => candidate.id === firstStopId);

    expect(stop?.color).toBe('#123456');
    expect(stop?.opacity).toBe(40);
  });

  it('should mirror stop positions on flip', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());
    const [firstStop, secondStop] = result.current.stops;

    // action
    act(() => result.current.flip());

    // result
    expect(result.current.stops[0].position).toBe(0);
    expect(result.current.stops[0].color).toBe(secondStop.color);
    expect(result.current.stops[1].position).toBe(1);
    expect(result.current.stops[1].color).toBe(firstStop.color);
  });

  it('should cycle the angle by 90 degrees on rotate, wrapping at 360', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    // action
    act(() => result.current.rotate());
    expect(result.current.angle).toBe(90);

    act(() => result.current.rotate());
    act(() => result.current.rotate());
    act(() => result.current.rotate());

    // result
    expect(result.current.angle).toBe(0);
  });

  it('should stop allowing more stops once the max supported by the gradient shader is reached', () => {
    // before
    const { result } = renderHook(() => useGradientPanel());

    // action — 2 default stops + 6 more = 8 (MAX_STOPS), one add per act so each sees fresh state
    for (let index = 0; index < 6; index += 1) {
      act(() => result.current.addStop(0.5));
    }

    // result
    expect(result.current.stops).toHaveLength(8);
    expect(result.current.canAddStop).toBe(false);

    // action — a 9th add is a no-op
    act(() => result.current.addStop(0.5));

    // result
    expect(result.current.stops).toHaveLength(8);
  });

  it('should notify onChange with the updated stops, type, and angle after every mutation', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useGradientPanel(onChange));

    // action
    act(() => result.current.rotate());

    // result
    expect(onChange).toHaveBeenLastCalledWith({ angle: 90, stops: result.current.stops, type: 'gradient-linear' });

    // action — switching type resets the points to that type's own default (radial: centered, reaching
    // the bottom edge), regardless of whatever angle/points the gradient previously had
    act(() => result.current.setType('gradient-radial'));

    // result
    expect(onChange).toHaveBeenLastCalledWith({
      angle: 0,
      end: { x: 0.5, y: 1 },
      start: { x: 0.5, y: 0.5 },
      stops: result.current.stops,
      type: 'gradient-radial',
    });

    // action
    act(() => result.current.addStop(0.5));

    // result
    expect(onChange).toHaveBeenLastCalledWith({
      angle: 90,
      end: { x: 0.5, y: 1 },
      start: { x: 0.5, y: 0.5 },
      stops: result.current.stops,
      type: 'gradient-radial',
    });
  });

  it('should seed stops and points from an initial gradient instead of the defaults', () => {
    // before
    const { result } = renderHook(() =>
      useGradientPanel(undefined, {
        end: { x: 1, y: 1 },
        start: { x: 0, y: 0 },
        stops: [
          { color: '#111111', opacity: 100, position: 0 },
          { color: '#222222', opacity: 50, position: 1 },
        ],
        type: 'gradient-linear',
      }),
    );

    // result
    expect(result.current.stops.map(({ color, opacity, position }) => ({ color, opacity, position }))).toEqual([
      { color: '#111111', opacity: 100, position: 0 },
      { color: '#222222', opacity: 50, position: 1 },
    ]);
    expect(result.current.angle).toBe(0);
  });

  it('should seed the type from an initial gradient instead of always defaulting to linear', () => {
    // before — the picker was opened on a shape whose fill is already an angular gradient
    const { result } = renderHook(() =>
      useGradientPanel(undefined, {
        end: { x: 0.5, y: 1 },
        start: { x: 0.5, y: 0.5 },
        stops: [
          { color: '#111111', opacity: 100, position: 0 },
          { color: '#222222', opacity: 50, position: 1 },
        ],
        type: 'gradient-angular',
      }),
    );

    // result — the type dropdown reads straight off this value, so it must reflect the real paint
    expect(result.current.type).toBe('gradient-angular');
  });

  it('should rotate the real start/end points around the gradient center when seeded with an initial gradient', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() =>
      useGradientPanel(onChange, {
        end: { x: 1, y: 0.5 },
        start: { x: 0, y: 0.5 },
        stops: [
          { color: '#ffffff', opacity: 100, position: 0 },
          { color: '#000000', opacity: 100, position: 1 },
        ],
        type: 'gradient-linear',
      }),
    );

    // action
    act(() => result.current.rotate());

    // result — rotating {x:0,y:0.5}/{x:1,y:0.5} by 90° around {0.5,0.5} swaps to a vertical line
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];

    expect(lastCall.start.x).toBeCloseTo(0.5);
    expect(lastCall.start.y).toBeCloseTo(0);
    expect(lastCall.end.x).toBeCloseTo(0.5);
    expect(lastCall.end.y).toBeCloseTo(1);
    expect(result.current.angle).toBe(0);
  });

  it('should not notify onChange when addStop is a no-op past the max stop count', () => {
    // mock
    const onChange = vi.fn();

    // before
    const { result } = renderHook(() => useGradientPanel(onChange));

    for (let index = 0; index < 6; index += 1) {
      act(() => result.current.addStop(0.5));
    }

    onChange.mockClear();

    // action
    act(() => result.current.addStop(0.5));

    // result
    expect(onChange).not.toHaveBeenCalled();
  });
});
