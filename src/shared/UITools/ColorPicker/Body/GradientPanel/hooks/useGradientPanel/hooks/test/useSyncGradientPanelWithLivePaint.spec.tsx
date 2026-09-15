import { RefObject } from 'react';
import { act, renderHook, RenderHookResult } from '@testing-library/react';

// hooks
import { useSyncGradientPanelWithLivePaint } from '../useSyncGradientPanelWithLivePaint';

// types
import { TEditableGradientStop, TGradientType, TInitialGradient } from '../../../../types';
import { TGradientPoints } from '../useRotateGradient';

const LOCAL_STOPS: TEditableGradientStop[] = [
  { color: '#ffffff', id: 'local-a', opacity: 100, position: 0 },
  { color: '#000000', id: 'local-b', opacity: 100, position: 1 },
];
const LOCAL_POINTS: TGradientPoints = { end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } };

type TProps = { initialGradient: TInitialGradient | undefined; isDragging: boolean };
type TResult = { setPoints: TFunc; setSelectedStopId: TFunc; setStops: TFunc; setType: TFunc };

const renderUseSync = (initialGradient: TInitialGradient | undefined, isDragging = false): RenderHookResult<TResult, TProps> =>
  renderHook(
    ({ initialGradient: gradient, isDragging: dragging }: TProps) => {
      const isDraggingRef: RefObject<boolean> = { current: dragging };
      const setStops = vi.fn();
      const setSelectedStopId = vi.fn();
      const setPoints = vi.fn();
      const setType = vi.fn();

      useSyncGradientPanelWithLivePaint(
        gradient,
        isDraggingRef,
        LOCAL_STOPS,
        setStops,
        'local-a',
        setSelectedStopId,
        LOCAL_POINTS,
        setPoints,
        'gradient-linear' as TGradientType,
        setType,
      );

      return { setPoints, setSelectedStopId, setStops, setType };
    },
    { initialProps: { initialGradient, isDragging } },
  );

describe('useSyncGradientPanelWithLivePaint', () => {
  it('should do nothing when there is no initialGradient (e.g. a solid paint)', () => {
    // before
    const { result } = renderUseSync(undefined);

    // result
    expect(result.current.setStops).not.toHaveBeenCalled();
    expect(result.current.setPoints).not.toHaveBeenCalled();
    expect(result.current.setType).not.toHaveBeenCalled();
  });

  it('should do nothing when local state already matches the live paint exactly', () => {
    // mock
    const initialGradient: TInitialGradient = {
      end: { x: 1, y: 0.5 },
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    };

    // before
    const { result } = renderUseSync(initialGradient);

    // result — no unnecessary setState calls when nothing actually changed
    expect(result.current.setStops).not.toHaveBeenCalled();
    expect(result.current.setSelectedStopId).not.toHaveBeenCalled();
    expect(result.current.setPoints).not.toHaveBeenCalled();
    expect(result.current.setType).not.toHaveBeenCalled();
  });

  it('should resync the points when the live paint was rotated/moved externally, e.g. on the canvas', () => {
    // before
    const { rerender, result } = renderUseSync(undefined);

    // action — the canvas rotated the gradient line
    act(() =>
      rerender({
        initialGradient: {
          end: { x: 0.5, y: 1 },
          start: { x: 0.5, y: 0 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0 },
            { color: '#000000', opacity: 100, position: 1 },
          ],
          type: 'gradient-linear',
        },
        isDragging: false,
      }),
    );

    // result
    expect(result.current.setPoints).toHaveBeenCalledWith({ end: { x: 0.5, y: 1 }, start: { x: 0.5, y: 0 } });
  });

  it('should resync the type dropdown when the live paint type changed externally, e.g. via undo', () => {
    // before
    const { rerender, result } = renderUseSync(undefined);

    // action
    act(() =>
      rerender({
        initialGradient: {
          end: { x: 1, y: 0.5 },
          start: { x: 0, y: 0.5 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0 },
            { color: '#000000', opacity: 100, position: 1 },
          ],
          type: 'gradient-radial',
        },
        isDragging: false,
      }),
    );

    // result
    expect(result.current.setType).toHaveBeenCalledWith('gradient-radial');
  });

  it('should reconcile a stop moved externally, keeping its id, and deselect it since its content changed', () => {
    // before
    const { rerender, result } = renderUseSync(undefined);

    // action — the canvas moved the first stop from position 0 to position 0.3
    act(() =>
      rerender({
        initialGradient: {
          end: { x: 1, y: 0.5 },
          start: { x: 0, y: 0.5 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0.3 },
            { color: '#000000', opacity: 100, position: 1 },
          ],
          type: 'gradient-linear',
        },
        isDragging: false,
      }),
    );

    // result — a stop matching the new (position 0.3, white) content gets a fresh id...
    expect(result.current.setStops).toHaveBeenCalledWith([
      expect.objectContaining({ color: '#ffffff', opacity: 100, position: 0.3 }),
      expect.objectContaining({ color: '#000000', id: 'local-b', opacity: 100, position: 1 }),
    ]);
    // ...and since the previously-selected stop ('local-a') no longer exists, it gets deselected
    expect(result.current.setSelectedStopId).toHaveBeenCalledWith(null);
  });

  it('should keep the current selection when the selected stop survives reconciliation, even if another stop changed', () => {
    // before — only the second (black) stop moves; the selected first (white) stop is untouched
    const { rerender, result } = renderUseSync(undefined);

    act(() =>
      rerender({
        initialGradient: {
          end: { x: 1, y: 0.5 },
          start: { x: 0, y: 0.5 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0 },
            { color: '#000000', opacity: 100, position: 0.6 },
          ],
          type: 'gradient-linear',
        },
        isDragging: false,
      }),
    );

    // result — stops were resynced (the second one changed), but the selection ('local-a') survives
    expect(result.current.setStops).toHaveBeenCalled();
    expect(result.current.setSelectedStopId).not.toHaveBeenCalled();
  });

  it('should preserve stop ids and the selection when reconciled stops match local content exactly', () => {
    // before — same content as LOCAL_STOPS, just without ids (as it would arrive from Redux)
    const { result } = renderUseSync({
      end: { x: 1, y: 0.5 },
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    });

    // result
    expect(result.current.setStops).not.toHaveBeenCalled();
    expect(result.current.setSelectedStopId).not.toHaveBeenCalled();
  });

  it('should not resync anything while a drag is in progress, even if the live paint already differs', () => {
    // before
    const { rerender, result } = renderUseSync(undefined, true);

    // action — an external change arrives mid-drag
    act(() =>
      rerender({
        initialGradient: {
          end: { x: 0.5, y: 1 },
          start: { x: 0.5, y: 0 },
          stops: [
            { color: '#ffffff', opacity: 100, position: 0 },
            { color: '#000000', opacity: 100, position: 1 },
          ],
          type: 'gradient-radial',
        },
        isDragging: true,
      }),
    );

    // result — nothing is touched while isDraggingRef.current is true
    expect(result.current.setStops).not.toHaveBeenCalled();
    expect(result.current.setPoints).not.toHaveBeenCalled();
    expect(result.current.setType).not.toHaveBeenCalled();
  });
});
