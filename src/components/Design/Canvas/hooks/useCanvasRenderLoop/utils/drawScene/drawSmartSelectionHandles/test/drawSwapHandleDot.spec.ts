// others
import {
  SMART_SELECTION_GAP_HANDLE_STROKE,
  SMART_SELECTION_SWAP_HANDLE_CORE_SIZE_PX,
  SMART_SELECTION_SWAP_HANDLE_FILL,
  SMART_SELECTION_SWAP_HANDLE_OUTLINE_SIZE_PX,
} from 'constant/canvas';

// utils
import { drawSwapHandleDot } from '../drawSwapHandleDot';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({
  drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawSwapHandleDot', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
  });

  it('should draw a white outline circle then a smaller pink core circle, both centred on the point', () => {
    drawSwapHandleDot(gl, program, buffer, 100, 60, 200, 200, IDENTITY_VIEWPORT);

    const outline = SMART_SELECTION_SWAP_HANDLE_OUTLINE_SIZE_PX;
    const core = SMART_SELECTION_SWAP_HANDLE_CORE_SIZE_PX;

    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock.mock.calls[0][3]).toEqual({
      fill: SMART_SELECTION_GAP_HANDLE_STROKE,
      height: outline,
      width: outline,
      x: 100 - outline / 2,
      y: 60 - outline / 2,
    });
    expect(drawEllipseMock.mock.calls[1][3]).toEqual({
      fill: SMART_SELECTION_SWAP_HANDLE_FILL,
      height: core,
      width: core,
      x: 100 - core / 2,
      y: 60 - core / 2,
    });
  });

  it('should keep a constant screen size regardless of zoom', () => {
    drawSwapHandleDot(gl, program, buffer, 0, 0, 200, 200, { x: 0, y: 0, zoom: 4 });

    expect(drawEllipseMock.mock.calls[0][3].width).toBeCloseTo(SMART_SELECTION_SWAP_HANDLE_OUTLINE_SIZE_PX / 4);
  });
});
