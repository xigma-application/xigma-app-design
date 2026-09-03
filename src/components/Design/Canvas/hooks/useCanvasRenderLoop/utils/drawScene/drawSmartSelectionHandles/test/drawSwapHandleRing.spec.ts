// others
import {
  SMART_SELECTION_GAP_HANDLE_STROKE,
  SMART_SELECTION_SWAP_HANDLE_FILL,
  SMART_SELECTION_SWAP_HANDLE_RING_DIAMETER_PX,
  SMART_SELECTION_SWAP_HANDLE_RING_PINK_PX,
  SMART_SELECTION_SWAP_HANDLE_RING_WHITE_PX,
} from 'constant/canvas';

// utils
import { drawSwapHandleRing } from '../drawSwapHandleRing';

const drawEllipseMock = vi.fn();
const drawThickEllipseOutlineMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({
  drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args),
}));
vi.mock('utils/canvas/shapes/drawThickEllipseOutline', () => ({
  drawThickEllipseOutline: (...args: unknown[]): void => drawThickEllipseOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawSwapHandleRing', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawThickEllipseOutlineMock.mockClear();
  });

  it('should stroke a 3px white ring and a 1px pink ring on the same centreline, so the pink sits in the middle of the white band', () => {
    drawSwapHandleRing(gl, program, buffer, 100, 60, false, 200, 200, IDENTITY_VIEWPORT);

    const white = SMART_SELECTION_SWAP_HANDLE_RING_WHITE_PX;
    const pink = SMART_SELECTION_SWAP_HANDLE_RING_PINK_PX;
    const centreline = SMART_SELECTION_SWAP_HANDLE_RING_DIAMETER_PX - white;
    const centrelineRect = {
      height: centreline,
      width: centreline,
      x: 100 - centreline / 2,
      y: 60 - centreline / 2,
    };

    expect(drawEllipseMock).not.toHaveBeenCalled();
    expect(drawThickEllipseOutlineMock).toHaveBeenCalledTimes(2);

    expect(drawThickEllipseOutlineMock.mock.calls[0][3]).toEqual(centrelineRect);
    expect(drawThickEllipseOutlineMock.mock.calls[0][4]).toBe(SMART_SELECTION_GAP_HANDLE_STROKE);
    expect(drawThickEllipseOutlineMock.mock.calls[0][5]).toBe(white);

    expect(drawThickEllipseOutlineMock.mock.calls[1][3]).toEqual(centrelineRect);
    expect(drawThickEllipseOutlineMock.mock.calls[1][4]).toBe(SMART_SELECTION_SWAP_HANDLE_FILL);
    expect(drawThickEllipseOutlineMock.mock.calls[1][5]).toBe(pink);
  });

  it('should fill pink from the middle of the border inward when hovered, leaving only the outer white sliver, and skip the pink stroke', () => {
    drawSwapHandleRing(gl, program, buffer, 100, 60, true, 200, 200, IDENTITY_VIEWPORT);

    const white = SMART_SELECTION_SWAP_HANDLE_RING_WHITE_PX;
    const pink = SMART_SELECTION_SWAP_HANDLE_RING_PINK_PX;
    const fillDiameter = SMART_SELECTION_SWAP_HANDLE_RING_DIAMETER_PX - (white - pink);

    // only the white ring is stroked; the pink centre-stroke is replaced by the solid fill
    expect(drawThickEllipseOutlineMock).toHaveBeenCalledTimes(1);
    expect(drawThickEllipseOutlineMock.mock.calls[0][4]).toBe(SMART_SELECTION_GAP_HANDLE_STROKE);

    expect(drawEllipseMock).toHaveBeenCalledTimes(1);
    expect(drawEllipseMock.mock.calls[0][3]).toEqual({
      fill: SMART_SELECTION_SWAP_HANDLE_FILL,
      height: fillDiameter,
      width: fillDiameter,
      x: 100 - fillDiameter / 2,
      y: 60 - fillDiameter / 2,
    });
  });

  it('should shrink the ring in world units as zoom increases', () => {
    drawSwapHandleRing(gl, program, buffer, 0, 0, false, 200, 200, { x: 0, y: 0, zoom: 4 });

    const centreline = SMART_SELECTION_SWAP_HANDLE_RING_DIAMETER_PX - SMART_SELECTION_SWAP_HANDLE_RING_WHITE_PX;

    expect(drawThickEllipseOutlineMock.mock.calls[0][3].width).toBeCloseTo(centreline / 4);
  });
});
