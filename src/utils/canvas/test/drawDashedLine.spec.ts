// utils
import { drawDashedLine } from '../drawDashedLine';

const drawLineMock = vi.fn();

vi.mock('../drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawDashedLine', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
  });

  it('should split a horizontal segment into evenly spaced dashes', () => {
    // before — a 20-unit segment with a 4/4 dash pattern fits 2.5 -> rounds to 3 dashes
    drawDashedLine(gl, program, buffer, { x1: 0, x2: 20, y1: 0, y2: 0 }, '#cd4422', 1, 100, 100, IDENTITY_VIEWPORT, 4, 4);

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(3);
    const [firstArgs] = drawLineMock.mock.calls;

    expect(firstArgs[3]).toEqual({ x1: 0, x2: expect.any(Number), y1: 0, y2: 0 });
    expect(firstArgs[4]).toBe('#cd4422');
    expect(firstArgs[5]).toBe(1);
  });

  it('should keep every dash on the line between its two endpoints', () => {
    // before — a diagonal segment
    drawDashedLine(gl, program, buffer, { x1: 0, x2: 10, y1: 0, y2: 10 }, '#cd4422', 1, 100, 100, IDENTITY_VIEWPORT, 3, 3);

    // result
    (drawLineMock.mock.calls as [unknown, unknown, unknown, { x1: number; x2: number; y1: number; y2: number }][]).forEach(
      ([, , , dash]) => {
        expect(dash.x1).toBeCloseTo(dash.y1);
        expect(dash.x2).toBeCloseTo(dash.y2);
        expect(dash.x1).toBeGreaterThanOrEqual(0);
        expect(dash.x2).toBeLessThanOrEqual(10);
      },
    );
  });

  it('should not draw a degenerate zero-length segment', () => {
    // before
    drawDashedLine(gl, program, buffer, { x1: 5, x2: 5, y1: 5, y2: 5 }, '#cd4422', 1, 100, 100, IDENTITY_VIEWPORT, 4, 4);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
  });

  it('should shrink the dash pattern length as zoom increases, so screen-space dash size stays constant', () => {
    // before — same segment at zoom 1 vs zoom 4
    drawDashedLine(gl, program, buffer, { x1: 0, x2: 40, y1: 0, y2: 0 }, '#cd4422', 1, 100, 100, IDENTITY_VIEWPORT, 4, 4);
    const callsAtZoom1 = drawLineMock.mock.calls.length;

    drawLineMock.mockClear();
    drawDashedLine(gl, program, buffer, { x1: 0, x2: 40, y1: 0, y2: 0 }, '#cd4422', 1, 100, 100, { x: 0, y: 0, zoom: 4 }, 4, 4);
    const callsAtZoom4 = drawLineMock.mock.calls.length;

    // result — more, smaller dashes fit in the same world-space length at a higher zoom
    expect(callsAtZoom4).toBeGreaterThan(callsAtZoom1);
  });
});
