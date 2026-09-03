// others
import { SMART_SELECTION_SWAP_SHADOW_STROKE } from 'constant/canvas';

// types
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { drawSmartSelectionSwapShadow } from '../drawSmartSelectionSwapShadow';

const drawRectMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({
  drawRect: (...args: unknown[]): void => drawRectMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

const dragState = (fromIndex: number, targetIndex: number): TSmartSelectionSwapDragState => ({
  dispatchThrottle: { frameId: null, run: null },
  fromIndex,
  hasMoved: true,
  nodeOrigins: {},
  pointerStart: { x: 0, y: 0 },
  slots: [
    { bounds: { height: 40, width: 60, x: 0, y: 0 }, id: 'a' },
    { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: 'b' },
    { bounds: { height: 50, width: 50, x: 200, y: 0 }, id: 'c' },
  ],
  targetIndex,
});

describe('drawSmartSelectionSwapShadow', () => {
  beforeEach(() => {
    drawRectMock.mockClear();
  });

  it("should stroke a blue outline the size of the held block at the target slot's origin", () => {
    drawSmartSelectionSwapShadow(gl, program, buffer, dragState(0, 2), 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock).toHaveBeenCalledTimes(1);
    expect(drawRectMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      // held block a is 60x40; it previews at slot c's origin (200, 0)
      { height: 40, stroke: SMART_SELECTION_SWAP_SHADOW_STROKE, width: 60, x: 200, y: 0 },
      200,
      200,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should follow the target index to a different slot', () => {
    drawSmartSelectionSwapShadow(gl, program, buffer, dragState(0, 1), 200, 200, IDENTITY_VIEWPORT);

    expect(drawRectMock.mock.calls[0][3]).toMatchObject({ height: 40, width: 60, x: 100, y: 0 });
  });
});
