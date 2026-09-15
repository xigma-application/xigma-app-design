// utils
import { drawDimensionHintArrowhead } from '../drawDimensionHintArrowhead';

const drawLineMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawDimensionHintArrowhead', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should draw two wings spread symmetrically around the line’s own angle, both starting at the tip', () => {
    // before — a horizontal line pointing right (angle 0), arrow tip at (10, 0)
    drawDimensionHintArrowhead(gl, program, buffer, { x: 10, y: 0 }, { x: 0, y: 0 }, '#0d99ff', 2, 200, 150, IDENTITY_VIEWPORT);

    // result — two lines drawn, each starting at the tip
    expect(drawLineMock).toHaveBeenCalledTimes(2);

    const firstWing = drawLineMock.mock.calls[0][3] as { x1: number; x2: number; y1: number; y2: number };
    const secondWing = drawLineMock.mock.calls[1][3] as { x1: number; x2: number; y1: number; y2: number };

    expect(firstWing.x1).toBe(10);
    expect(firstWing.y1).toBe(0);
    expect(secondWing.x1).toBe(10);
    expect(secondWing.y1).toBe(0);

    // result — the two wings are mirror images of each other across the line's own axis (y1 flips sign)
    expect(firstWing.x2).toBeCloseTo(secondWing.x2, 5);
    expect(firstWing.y2).toBeCloseTo(-secondWing.y2, 5);

    // result — each wing tip lands 6px (the arrow size constant, at zoom 1) away from the arrow tip
    const wingLength = Math.hypot(firstWing.x2 - firstWing.x1, firstWing.y2 - firstWing.y1);

    expect(wingLength).toBeCloseTo(6, 4);

    // result — every draw call shares the given color, stroke width and canvas/viewport args
    expect(drawLineMock).toHaveBeenNthCalledWith(1, gl, program, buffer, expect.anything(), '#0d99ff', 2, 200, 150, IDENTITY_VIEWPORT);
    expect(drawLineMock).toHaveBeenNthCalledWith(2, gl, program, buffer, expect.anything(), '#0d99ff', 2, 200, 150, IDENTITY_VIEWPORT);
  });

  it('should scale the wing length down as the viewport zooms in, keeping it a constant screen size', () => {
    // before
    drawDimensionHintArrowhead(gl, program, buffer, { x: 10, y: 0 }, { x: 0, y: 0 }, '#0d99ff', 2, 200, 150, { x: 0, y: 0, zoom: 2 });

    // result
    const wing = drawLineMock.mock.calls[0][3] as { x1: number; x2: number; y1: number; y2: number };
    const wingLength = Math.hypot(wing.x2 - wing.x1, wing.y2 - wing.y1);

    expect(wingLength).toBeCloseTo(3, 4);
  });
});
