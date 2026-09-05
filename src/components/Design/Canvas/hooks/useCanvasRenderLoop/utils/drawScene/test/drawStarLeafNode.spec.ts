// types
import { NodeType } from 'types/design/enums';
import { TDrawContext } from '../types';
import { TStarNode } from 'types/design/types';

// utils
import { drawStarLeafNode } from '../drawStarLeafNode';

const drawStarMock = vi.fn();

vi.mock('utils/canvas/drawStar/drawStar', () => ({ drawStar: (...args: unknown[]): void => drawStarMock(...args) }));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const context: TDrawContext = { buffer, canvasHeight: 150, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT };

const star = (overrides: Partial<TStarNode> = {}): TStarNode => ({
  fill: '#fff',
  flipX: false,
  flipY: false,
  height: 20,
  id: 's1',
  name: 'Star',
  parentId: null,
  points: 5,
  ratio: 0.5,
  rotation: 0,
  type: NodeType.star,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawStarLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the star with the threaded opacity and its own flip/rotation', () => {
    // mock
    const node = star({ flipX: true, flipY: true, rotation: 15 });

    // action
    drawStarLeafNode(context, node, 0.5);

    // result
    expect(drawStarMock).toHaveBeenCalledWith(
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
