// types
import { TVectorNodeRotateSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeRotateSnapshot } from '../drawVectorNodeRotateSnapshot';

const drawVectorFillMock = vi.fn();
const drawVectorThickStrokeVerticesMock = vi.fn();

vi.mock('../drawVectorFill', () => ({ drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args) }));
vi.mock('../drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;

describe('drawVectorNodeRotateSnapshot', () => {
  beforeEach(() => {
    drawVectorFillMock.mockClear();
    drawVectorThickStrokeVerticesMock.mockClear();
  });

  it('should rotate each color group’s face points around the pivot by the current delta, then draw one fill call per color', () => {
    // mock — a 90° turn around (0,0): (10,0) -> (0,10)
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 90,
      facesByColor: [{ color: '#ff0000', points: [[{ x: 10, y: 0 }]] }],
      pivot: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };

    // before
    drawVectorNodeRotateSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

    // result
    const [[{ x, y }]] = drawVectorFillMock.mock.calls[0][5] as { x: number; y: number }[][];

    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(10);
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      null,
      expect.anything(),
      '#ff0000',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should leave the shape untouched when the delta is zero', () => {
    // mock
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 0,
      facesByColor: [{ color: '#ff0000', points: [[{ x: 10, y: 5 }]] }],
      pivot: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };

    // before
    drawVectorNodeRotateSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      null,
      [[{ x: 10, y: 5 }]],
      '#ff0000',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should rotate the flat stroke vertex list point-by-point around the pivot', () => {
    // mock — a 90° turn around (0,0): (10,0) -> (0,10), (0,10) -> (-10,0)
    const snapshot: TVectorNodeRotateSnapshot = {
      deltaDegrees: 90,
      facesByColor: [],
      pivot: { x: 0, y: 0 },
      strokeColor: '#0d99ff',
      strokeVertices: [10, 0, 0, 10],
    };

    // before
    drawVectorNodeRotateSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();

    const rotatedVertices = drawVectorThickStrokeVerticesMock.mock.calls[0][4] as number[];

    expect(rotatedVertices[0]).toBeCloseTo(0);
    expect(rotatedVertices[1]).toBeCloseTo(10);
    expect(rotatedVertices[2]).toBeCloseTo(-10);
    expect(rotatedVertices[3]).toBeCloseTo(0);
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      expect.anything(),
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
