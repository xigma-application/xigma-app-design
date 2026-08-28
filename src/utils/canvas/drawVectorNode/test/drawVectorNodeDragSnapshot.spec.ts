// types
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorNodeDragSnapshot } from '../drawVectorNodeDragSnapshot';

const drawVectorFillMock = vi.fn();
const drawVectorThickStrokeVerticesMock = vi.fn();

vi.mock('../drawVectorFill', () => ({ drawVectorFill: (...args: unknown[]): void => drawVectorFillMock(...args) }));
vi.mock('../drawVectorThickStrokeVertices', () => ({
  drawVectorThickStrokeVertices: (...args: unknown[]): void => drawVectorThickStrokeVerticesMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorNodeDragSnapshot', () => {
  beforeEach(() => {
    drawVectorFillMock.mockClear();
    drawVectorThickStrokeVerticesMock.mockClear();
  });

  it('should translate each color group’s faces by the snapshot delta then draw one fill call per color', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 5,
      deltaY: 10,
      facesByColor: [
        {
          color: '#ff0000',
          points: [
            [
              { x: 0, y: 0 },
              { x: 1, y: 0 },
            ],
          ],
        },
        { color: '#00ff00', points: [[{ x: 2, y: 2 }]] },
      ],
      strokeColor: '#0d99ff',
      strokeVertices: [],
    };

    // before
    drawVectorNodeDragSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).toHaveBeenCalledTimes(2);
    expect(drawVectorFillMock).toHaveBeenNthCalledWith(
      1,
      gl,
      program,
      buffer,
      null,
      null,
      [
        [
          { x: 5, y: 10 },
          { x: 6, y: 10 },
        ],
      ],
      '#ff0000',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
    expect(drawVectorFillMock).toHaveBeenNthCalledWith(
      2,
      gl,
      program,
      buffer,
      null,
      null,
      [[{ x: 7, y: 12 }]],
      '#00ff00',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });

  it('should translate the flat stroke vertex list by the delta, alternating x/y offsets by index parity', () => {
    // mock
    const gl = {} as WebGL2RenderingContext;
    const program = {} as WebGLProgram;
    const buffer = {} as WebGLBuffer;
    const snapshot: TVectorNodeDragSnapshot = {
      deltaX: 3,
      deltaY: 4,
      facesByColor: [],
      strokeColor: '#0d99ff',
      strokeVertices: [0, 0, 10, 0, 10, 1, 0, 1],
    };

    // before
    drawVectorNodeDragSnapshot(gl, program, buffer, snapshot, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorFillMock).not.toHaveBeenCalled();
    expect(drawVectorThickStrokeVerticesMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      null,
      [3, 4, 13, 4, 13, 5, 3, 5],
      '#0d99ff',
      200,
      150,
      IDENTITY_VIEWPORT,
    );
  });
});
