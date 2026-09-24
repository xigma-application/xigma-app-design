// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { drawShapeContactGuides } from '../drawShapeContactGuides';

const drawLineBatchMock = vi.fn();

vi.mock('utils/canvas/drawLineBatch', () => ({ drawLineBatch: (...args: unknown[]): void => drawLineBatchMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawShapeContactGuides', () => {
  beforeEach(() => {
    drawLineBatchMock.mockClear();
  });

  it('should draw nothing when there are no guides', () => {
    // before
    drawShapeContactGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs(),
    );

    // result
    expect(drawLineBatchMock).not.toHaveBeenCalled();
  });

  it('should batch every guide with an X marker at each end into a single draw', () => {
    // before
    drawShapeContactGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: IDENTITY_VIEWPORT },
      createCanvasRefs({
        transform: {
          contactGuidesRef: {
            current: [
              { x1: 100, x2: 100, y1: 0, y2: 100 },
              { x1: 0, x2: 100, y1: 100, y2: 100 },
            ],
          },
        },
      }),
    );

    // result
    expect(drawLineBatchMock).toHaveBeenCalledTimes(1);

    const [, , , segments, color, strokeWidth, canvasWidth, canvasHeight, viewport] = drawLineBatchMock.mock.calls[0];

    expect(segments).toHaveLength(10);
    expect(segments[0]).toEqual({ x1: 100, x2: 100, y1: 0, y2: 100 });
    expect(segments[1]).toEqual({ x1: 98, x2: 102, y1: -2, y2: 2 });
    expect(segments[3]).toEqual({ x1: 98, x2: 102, y1: 98, y2: 102 });
    expect([color, strokeWidth, canvasWidth, canvasHeight, viewport]).toEqual(['#cd7259', 1, 200, 150, IDENTITY_VIEWPORT]);
  });

  it('should scale the stroke width and marker size down with zoom', () => {
    // before
    drawShapeContactGuides(
      { buffer, canvasHeight: 150, canvasWidth: 200, gl, imageContext: {} as never, program, viewport: { x: 0, y: 0, zoom: 2 } },
      createCanvasRefs({ transform: { contactGuidesRef: { current: [{ x1: 0, x2: 10, y1: 0, y2: 0 }] } } }),
    );

    // result
    const [, , , segments, , strokeWidth] = drawLineBatchMock.mock.calls[0];

    expect(strokeWidth).toBe(0.5);
    expect(segments[1]).toEqual({ x1: -1, x2: 1, y1: -1, y2: 1 });
  });
});
