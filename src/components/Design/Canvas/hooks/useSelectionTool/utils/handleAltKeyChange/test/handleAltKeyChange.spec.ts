// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { handleAltKeyChange } from '../handleAltKeyChange';

describe('handleAltKeyChange', () => {
  it('should forward a synthetic pointermove at the last known position when Alt changes over an Alt-hover tool', () => {
    // mock
    const canvas = {} as HTMLCanvasElement;
    const canvasRefs = {} as TCanvasRefs;
    const selectRefs = {} as TSelectionToolRefs;
    const onPointerMove = vi.fn();

    // action
    handleAltKeyChange(
      canvas,
      new KeyboardEvent('keydown', { altKey: true, key: 'Alt' }),
      canvasRefs,
      selectRefs,
      ToolName.default,
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
    expect(forwardedEvent.altKey).toBe(true);
    expect(forwardedCanvasRefs).toBe(canvasRefs);
    expect(forwardedSelectRefs).toBe(selectRefs);
  });

  it('should do nothing when there is no reason to forward the change', () => {
    // mock
    const onPointerMove = vi.fn();

    // action
    handleAltKeyChange(
      {} as HTMLCanvasElement,
      new KeyboardEvent('keydown', { key: 'Alt' }),
      {} as TCanvasRefs,
      {} as TSelectionToolRefs,
      ToolName.pen,
      { x: 10, y: 20 },
      onPointerMove,
    );

    // result
    expect(onPointerMove).not.toHaveBeenCalled();
  });
});
