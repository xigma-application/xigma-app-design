// types
import { TEllipseNode } from 'types/design/types';

// utils
import { drawHoveredArcHandles } from '../drawHoveredArcHandles';

const drawHandleMock = vi.fn();
const hasRotateMock = vi.fn();
const ratioPositionMock = vi.fn(() => ({ x: 3, y: 3 }));

vi.mock('utils/canvas/drawEllipseArcHandle', () => ({ drawEllipseArcHandle: (...args: unknown[]): unknown => drawHandleMock(...args) }));
vi.mock('utils/canvas/ellipseArc/getEllipseArcHandlePosition', () => ({ getEllipseArcHandlePosition: (): unknown => ({ x: 1, y: 1 }) }));
vi.mock('utils/canvas/ellipseArc/getEllipseArcRatioHandlePosition', () => ({
  getEllipseArcRatioHandlePosition: (...args: unknown[]): unknown => ratioPositionMock(...(args as [])),
}));
vi.mock('utils/canvas/ellipseArc/getEllipseArcRotateHandlePosition', () => ({
  getEllipseArcRotateHandlePosition: (): unknown => ({ x: 2, y: 2 }),
}));
vi.mock('utils/canvas/ellipseArc/hasEllipseArcRotateHandle', () => ({
  hasEllipseArcRotateHandle: (...args: unknown[]): unknown => hasRotateMock(...args),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const bounds = { height: 10, width: 10, x: 0, y: 0 };
const viewport = { x: 0, y: 0, zoom: 1 };
const node = { rotation: 0 } as TEllipseNode;

const draw = (options: { dragged?: boolean; fullyCutAway?: boolean; hovered?: boolean; inverted?: boolean } = {}): void =>
  drawHoveredArcHandles(
    gl,
    program,
    buffer,
    bounds,
    10,
    100,
    0.5,
    options.fullyCutAway ?? false,
    options.hovered ?? true,
    options.inverted ? { ...node, arcRatioInverted: true } : node,
    200,
    100,
    viewport,
    options.dragged ? { x: 7, y: 7 } : undefined,
    options.dragged ? { x: 8, y: 8 } : undefined,
    options.dragged ? { x: 9, y: 9 } : undefined,
  );

const positions = (): unknown[] => drawHandleMock.mock.calls.map((call) => call[10]);

describe('drawHoveredArcHandles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the end, rotate and ratio handles at their computed positions', () => {
    // mock
    hasRotateMock.mockReturnValue(true);

    // before
    draw();

    // result
    expect(positions()).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ]);
    expect(drawHandleMock.mock.calls[1][11]).toBe(true);
    expect(ratioPositionMock).toHaveBeenCalledWith(bounds, 10, 100, 0.5, node, false);
  });

  it('should draw the handles at their dragged positions and pass on an inverted ratio', () => {
    // mock
    hasRotateMock.mockReturnValue(true);

    // before
    draw({ dragged: true });
    draw({ inverted: true });

    // result
    expect(positions().slice(0, 3)).toEqual([
      { x: 7, y: 7 },
      { x: 8, y: 8 },
      { x: 9, y: 9 },
    ]);
    expect(ratioPositionMock).toHaveBeenCalledWith(bounds, 10, 100, 0.5, expect.anything(), true);
  });

  it('should skip the rotate handle for a full ellipse and the ratio handle once fully cut away', () => {
    // mock
    hasRotateMock.mockReturnValue(false);

    // before
    draw({ fullyCutAway: true });

    // result
    expect(positions()).toEqual([{ x: 1, y: 1 }]);
  });

  it('should draw nothing while the ellipse is not hovered', () => {
    // before
    draw({ hovered: false });

    // result
    expect(drawHandleMock).not.toHaveBeenCalled();
  });
});
