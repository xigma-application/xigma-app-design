// types
import { TDrawSceneContext } from '../../types';

// utils
import { drawProgressiveBlurLabel } from '../drawProgressiveBlurLabel';

const drawValueLabelMock = vi.fn();

vi.mock('utils/canvas/text/drawValueLabel/drawValueLabel', () => ({
  drawValueLabel: (...args: unknown[]): void => drawValueLabelMock(...args),
}));

describe('drawProgressiveBlurLabel', () => {
  it('should draw the text up and to the right of the point, with a margin that shrinks with zoom', () => {
    // mock
    const context = {
      buffer: {},
      canvasHeight: 600,
      canvasWidth: 800,
      gl: {},
      imageContext: {},
      program: {},
      viewport: { x: 0, y: 0, zoom: 2 },
    } as unknown as TDrawSceneContext;

    // action
    drawProgressiveBlurLabel(context, { x: 100, y: 50 }, 'Start 0');

    // result
    const [, , , , text, anchor, direction] = drawValueLabelMock.mock.calls[0] as [
      unknown,
      unknown,
      unknown,
      unknown,
      string,
      { x: number; y: number },
      { x: number; y: number },
    ];

    expect(text).toBe('Start 0');
    expect(direction.x).toBeGreaterThan(0);
    expect(direction.y).toBeLessThan(0);
    expect(anchor.x).toBeCloseTo(100 + Math.SQRT1_2 * 5);
    expect(anchor.y).toBeCloseTo(50 - Math.SQRT1_2 * 5);
  });
});
