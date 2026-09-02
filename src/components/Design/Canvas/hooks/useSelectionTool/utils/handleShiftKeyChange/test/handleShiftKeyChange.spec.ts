// types
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { handleShiftKeyChange } from '../handleShiftKeyChange';

const createSelectRefs = (overrides: Partial<TSelectionToolRefs>): TSelectionToolRefs =>
  ({
    dragStateRef: { current: null },
    vectorEraseDragRef: { current: null },
    vectorHandleDragRef: { current: null },
    ...overrides,
  }) as TSelectionToolRefs;

describe('handleShiftKeyChange', () => {
  it('should forward a synthetic pointermove at the last known position when a vector drag is in progress', () => {
    // mock
    const canvas = {} as HTMLCanvasElement;
    const canvasRefs = {} as Parameters<typeof handleShiftKeyChange>[2];
    const selectRefs = createSelectRefs({ vectorHandleDragRef: { current: {} } as TSelectionToolRefs['vectorHandleDragRef'] });
    const onPointerMove = vi.fn();

    // action
    handleShiftKeyChange(
      canvas,
      new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true }),
      canvasRefs,
      selectRefs,
      { x: 10, y: 20 },
      onPointerMove,
    );

    // result
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    const [forwardedCanvas, forwardedEvent, forwardedCanvasRefs, forwardedSelectRefs] = onPointerMove.mock.calls[0];

    expect(forwardedCanvas).toBe(canvas);
    expect(forwardedEvent.type).toBe('pointermove');
    expect(forwardedEvent.clientX).toBe(10);
    expect(forwardedEvent.clientY).toBe(20);
    expect(forwardedEvent.shiftKey).toBe(true);
    expect(forwardedCanvasRefs).toBe(canvasRefs);
    expect(forwardedSelectRefs).toBe(selectRefs);
  });

  it('should do nothing when there is no reason to forward the change', () => {
    // mock
    const onPointerMove = vi.fn();

    // action
    handleShiftKeyChange(
      {} as HTMLCanvasElement,
      new KeyboardEvent('keydown', { key: 'Shift' }),
      {} as Parameters<typeof handleShiftKeyChange>[2],
      createSelectRefs({}),
      { x: 10, y: 20 },
      onPointerMove,
    );

    // result
    expect(onPointerMove).not.toHaveBeenCalled();
  });
});
