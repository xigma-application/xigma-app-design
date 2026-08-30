// utils
import { drawShapeContactGuides } from '../drawShapeContactGuides';

const drawLineMock = vi.fn();
const drawXMarkerMock = vi.fn();

vi.mock('utils/canvas/drawLine', () => ({ drawLine: (...args: unknown[]): void => drawLineMock(...args) }));
vi.mock('utils/canvas/drawXMarker', () => ({ drawXMarker: (...args: unknown[]): void => drawXMarkerMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawShapeContactGuides', () => {
  beforeEach(() => {
    drawLineMock.mockClear();
    drawXMarkerMock.mockClear();
  });

  it('should draw nothing when there are no guides', () => {
    // before
    drawShapeContactGuides(gl, program, buffer, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawLineMock).not.toHaveBeenCalled();
    expect(drawXMarkerMock).not.toHaveBeenCalled();
  });

  it('should draw one line plus an X marker at each end of every guide', () => {
    // before
    drawShapeContactGuides(
      gl,
      program,
      buffer,
      [
        { x1: 100, x2: 100, y1: 0, y2: 100 },
        { x1: 0, x2: 100, y1: 100, y2: 100 },
      ],
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawLineMock).toHaveBeenCalledTimes(2);
    expect(drawXMarkerMock).toHaveBeenCalledTimes(4);
    expect(drawLineMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      { x1: 100, x2: 100, y1: 0, y2: 100 },
      '#cd7259',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawXMarkerMock).toHaveBeenNthCalledWith(1, gl, program, buffer, { x: 100, y: 0 }, 2, '#cd7259', 1, 200, 150, IDENTITY_VIEWPORT);
    expect(drawXMarkerMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      { x: 100, y: 100 },
      2,
      '#cd7259',
      1,
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should scale the stroke width and marker size down with zoom', () => {
    // before
    drawShapeContactGuides(gl, program, buffer, [{ x1: 0, x2: 10, y1: 0, y2: 0 }], 200, 150, { x: 0, y: 0, zoom: 2 });

    // result
    expect(drawLineMock.mock.calls[0][5]).toBe(0.5);
    expect(drawXMarkerMock.mock.calls[0][4]).toBe(1);
    expect(drawXMarkerMock.mock.calls[0][6]).toBe(0.5);
  });
});
