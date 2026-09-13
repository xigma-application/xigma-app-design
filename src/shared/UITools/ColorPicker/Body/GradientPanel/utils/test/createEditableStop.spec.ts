// utils
import { createEditableStop } from '../createEditableStop';

describe('createEditableStop', () => {
  it('should build a stop carrying the given position, color, and opacity', () => {
    // action
    const stop = createEditableStop(0.5, '#ff0000', 80);

    // result
    expect(stop.position).toBe(0.5);
    expect(stop.color).toBe('#ff0000');
    expect(stop.opacity).toBe(80);
  });

  it('should assign a unique id to each created stop', () => {
    // action
    const first = createEditableStop(0, '#ffffff', 100);
    const second = createEditableStop(1, '#000000', 100);

    // result
    expect(first.id).not.toBe(second.id);
  });
});
