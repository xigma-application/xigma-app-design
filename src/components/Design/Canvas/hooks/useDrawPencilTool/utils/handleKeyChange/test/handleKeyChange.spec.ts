// utils
import { handleKeyChange } from '../handleKeyChange';

const createCanvas = (): HTMLCanvasElement => document.createElement('canvas');

const keyboardEvent = (key: string, options: Partial<KeyboardEventInit> = {}): KeyboardEvent =>
  new KeyboardEvent('keydown', { key, ...options });

describe('handleKeyChange', () => {
  it('should replay a synthetic pointermove at the last known pointer position when Shift changes', () => {
    // mock
    const canvas = createCanvas();
    const onPointerMove = vi.fn();

    // before
    handleKeyChange(canvas, keyboardEvent('Shift', { shiftKey: true }), onPointerMove, { x: 10, y: 20 });

    // result
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    const [replayedCanvas, replayedEvent] = onPointerMove.mock.calls[0] as [HTMLCanvasElement, PointerEvent];

    expect(replayedCanvas).toBe(canvas);
    expect(replayedEvent.type).toBe('pointermove');
    expect(replayedEvent.clientX).toBe(10);
    expect(replayedEvent.clientY).toBe(20);
    expect(replayedEvent.shiftKey).toBe(true);
  });

  it('should replay on Control and Meta as well as Shift', () => {
    // mock
    const canvas = createCanvas();
    const onPointerMove = vi.fn();

    // before
    handleKeyChange(canvas, keyboardEvent('Control', { ctrlKey: true }), onPointerMove, { x: 0, y: 0 });
    handleKeyChange(canvas, keyboardEvent('Meta', { metaKey: true }), onPointerMove, { x: 0, y: 0 });

    // result
    expect(onPointerMove).toHaveBeenCalledTimes(2);
  });

  it('should ignore an unrelated key', () => {
    // mock
    const canvas = createCanvas();
    const onPointerMove = vi.fn();

    // before
    handleKeyChange(canvas, keyboardEvent('a'), onPointerMove, { x: 10, y: 20 });

    // result
    expect(onPointerMove).not.toHaveBeenCalled();
  });

  it('should do nothing when there is no prior pointer position to replay', () => {
    // mock
    const canvas = createCanvas();
    const onPointerMove = vi.fn();

    // before
    handleKeyChange(canvas, keyboardEvent('Shift', { shiftKey: true }), onPointerMove, null);

    // result
    expect(onPointerMove).not.toHaveBeenCalled();
  });
});
