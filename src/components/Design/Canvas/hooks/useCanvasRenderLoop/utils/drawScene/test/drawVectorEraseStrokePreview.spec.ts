// others
import { BACKGROUND_COLOR } from 'constant/canvas';

// types
import { ToolName } from 'types/design/enums';

// utils
import { drawVectorEraseStrokePreview } from '../drawVectorEraseStrokePreview';

const drawEllipseMock = vi.fn();
const drawVectorStrokeMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));
vi.mock('utils/canvas/drawVectorNode/drawVectorStroke', () => ({
  drawVectorStroke: (...args: unknown[]): void => drawVectorStrokeMock(...args),
}));

const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

describe('drawVectorEraseStrokePreview', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
    drawVectorStrokeMock.mockClear();
  });

  it('should draw nothing when the Erase tool is not active', () => {
    // before
    drawVectorEraseStrokePreview(gl, program, buffer, [{ x: 0, y: 0 }], 10, ToolName.cut, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).not.toHaveBeenCalled();
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should draw nothing when there is no stroke in progress', () => {
    // before
    drawVectorEraseStrokePreview(gl, program, buffer, null, 10, ToolName.erase, 200, 150, IDENTITY_VIEWPORT);
    drawVectorEraseStrokePreview(gl, program, buffer, [], 10, ToolName.erase, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
  });

  it('should cap a single-point stroke with one background-coloured disc and no polyline', () => {
    // before
    drawVectorEraseStrokePreview(gl, program, buffer, [{ x: 50, y: 50 }], 20, ToolName.erase, 200, 150, IDENTITY_VIEWPORT);

    // result — both end caps resolve to the same point, so drawEllipse fires twice with the bg colour
    expect(drawVectorStrokeMock).not.toHaveBeenCalled();
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
    expect(drawEllipseMock).toHaveBeenLastCalledWith(
      gl,
      program,
      buffer,
      expect.objectContaining({ fill: BACKGROUND_COLOR, height: 20, width: 20, x: 40, y: 40 }),
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should stroke the swept brush path plus end caps in the background colour for a multi-point stroke', () => {
    // before
    drawVectorEraseStrokePreview(
      gl,
      program,
      buffer,
      [
        { x: 0, y: 0 },
        { x: 30, y: 0 },
        { x: 60, y: 0 },
      ],
      16,
      ToolName.erase,
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
    );

    // result — radius = 16 / 2 / 2 = 4, so the stroke width is 8
    expect(drawVectorStrokeMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      [
        {
          endId: '',
          points: [
            { x: 0, y: 0 },
            { x: 30, y: 0 },
            { x: 60, y: 0 },
          ],
          segmentId: '',
          startId: '',
        },
      ],
      BACKGROUND_COLOR,
      8,
      200,
      150,
      { x: 0, y: 0, zoom: 2 },
    );
    expect(drawEllipseMock).toHaveBeenCalledTimes(2);
  });
});
