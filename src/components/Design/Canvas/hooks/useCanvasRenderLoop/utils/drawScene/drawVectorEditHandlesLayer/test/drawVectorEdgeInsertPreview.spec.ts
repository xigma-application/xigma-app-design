// others
import { VECTOR_VERTEX_FILL, VECTOR_VERTEX_HOVER_SCALE, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// utils
import { drawVectorEdgeInsertPreview } from '../drawVectorEdgeInsertPreview';

const drawEllipseMock = vi.fn();

vi.mock('utils/canvas/shapes/drawEllipse', () => ({ drawEllipse: (...args: unknown[]): void => drawEllipseMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const SIZE = VECTOR_VERTEX_SIZE * VECTOR_VERTEX_HOVER_SCALE;

describe('drawVectorEdgeInsertPreview', () => {
  beforeEach(() => {
    drawEllipseMock.mockClear();
  });

  it('should draw a hover-sized dot at the given point', () => {
    // before
    drawVectorEdgeInsertPreview(
      {} as WebGL2RenderingContext,
      {} as WebGLProgram,
      {} as WebGLBuffer,
      { x: 50, y: 10 },
      200,
      150,
      IDENTITY_VIEWPORT,
    );

    // result
    expect(drawEllipseMock).toHaveBeenCalledWith(
      {},
      {},
      {},
      { fill: VECTOR_VERTEX_FILL, height: SIZE, width: SIZE, x: 50 - SIZE / 2, y: 10 - SIZE / 2 },
      200,
      150,
      IDENTITY_VIEWPORT,
      0,
    );
  });

  it('should draw nothing when there is no point', () => {
    // before
    drawVectorEdgeInsertPreview({} as WebGL2RenderingContext, {} as WebGLProgram, {} as WebGLBuffer, null, 200, 150, IDENTITY_VIEWPORT);

    // result
    expect(drawEllipseMock).not.toHaveBeenCalled();
  });
});
