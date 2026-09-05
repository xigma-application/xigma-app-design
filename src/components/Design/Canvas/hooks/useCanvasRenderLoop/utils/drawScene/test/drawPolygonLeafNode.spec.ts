// types
import { NodeType } from 'types/design/enums';
import { TDrawContext } from '../types';
import { TPolygonNode } from 'types/design/types';

// utils
import { drawPolygonLeafNode } from '../drawPolygonLeafNode';

const drawPolygonMock = vi.fn();

vi.mock('utils/canvas/drawPolygon/drawPolygon', () => ({ drawPolygon: (...args: unknown[]): void => drawPolygonMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const context: TDrawContext = { buffer, canvasHeight: 150, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT };

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fill: '#fff',
  flipX: false,
  flipY: false,
  height: 20,
  id: 'p1',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawPolygonLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the polygon with the threaded opacity and its own flip/rotation', () => {
    // mock
    const node = polygon({ flipX: true, flipY: true, rotation: 15 });

    // action
    drawPolygonLeafNode(context, node, 0.5);

    // result
    expect(drawPolygonMock).toHaveBeenCalledWith(
      gl,
      program,
      buffer,
      { ...node, fillAlpha: 0.5 },
      200,
      150,
      IDENTITY_VIEWPORT,
      true,
      true,
      15,
    );
  });
});
