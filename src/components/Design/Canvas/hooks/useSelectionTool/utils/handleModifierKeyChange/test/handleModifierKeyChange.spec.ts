// types
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { handleModifierKeyChange } from '../handleModifierKeyChange';

const createSelectRefs = (overrides: Partial<TSelectionToolRefs>): TSelectionToolRefs =>
  ({
    dragStateRef: { current: null },
    ...overrides,
  }) as TSelectionToolRefs;

describe('handleModifierKeyChange', () => {
  it('should forward a synthetic pointermove at the last known position when a drag is in progress', () => {
    // mock
    const canvas = {} as HTMLCanvasElement;
    const canvasRefs = {} as Parameters<typeof handleModifierKeyChange>[2];
    const selectRefs = createSelectRefs({ dragStateRef: { current: {} } as TSelectionToolRefs['dragStateRef'] });
    const onPointerMove = vi.fn();

    // action
    handleModifierKeyChange(
      canvas,
      new KeyboardEvent('keydown', { ctrlKey: true, key: 'Control' }),
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
    expect(forwardedEvent.ctrlKey).toBe(true);
    expect(forwardedCanvasRefs).toBe(canvasRefs);
    expect(forwardedSelectRefs).toBe(selectRefs);
  });

  it('should do nothing when there is no reason to forward the change', () => {
    // mock
    const onPointerMove = vi.fn();

    // action
    handleModifierKeyChange(
      {} as HTMLCanvasElement,
      new KeyboardEvent('keydown', { key: 'Control' }),
      {} as Parameters<typeof handleModifierKeyChange>[2],
      createSelectRefs({}),
      { x: 10, y: 20 },
      onPointerMove,
    );

    // result
    expect(onPointerMove).not.toHaveBeenCalled();
  });
});
