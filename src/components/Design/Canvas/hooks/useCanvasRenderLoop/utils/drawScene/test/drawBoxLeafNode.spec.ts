// types
import { NodeType } from 'types/design/enums';
import { TDrawContext } from '../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { drawBoxLeafNode } from '../drawBoxLeafNode';

const drawRectMock = vi.fn();
const drawThickOutlineMock = vi.fn();

vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const gl = {} as WebGL2RenderingContext;
const program = {} as WebGLProgram;
const buffer = {} as WebGLBuffer;
const context: TDrawContext = { buffer, canvasHeight: 150, canvasWidth: 200, gl, program, viewport: IDENTITY_VIEWPORT };

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#fff',
  height: 20,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
  ...overrides,
});

describe('drawBoxLeafNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should draw the fill with the threaded opacity and skip the stroke when unset', () => {
    // mock
    const node = rect();

    // action
    drawBoxLeafNode(context, node, 0.5);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(gl, program, buffer, { ...node, fillAlpha: 0.5 }, 200, 150, IDENTITY_VIEWPORT, 0);
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });

  it('should draw the stroke outline when both strokeColor and strokeWidth are set', () => {
    // mock
    const node = rect({ strokeColor: '#000', strokeWidth: 2 });

    // action
    drawBoxLeafNode(context, node, 1);

    // result
    expect(drawThickOutlineMock).toHaveBeenCalledWith(gl, program, buffer, node, '#000', 2, 200, 150, IDENTITY_VIEWPORT, 0);
  });

  it('should skip the stroke outline when strokeWidth is missing, even with a strokeColor set', () => {
    // mock
    const node = rect({ strokeColor: '#000' });

    // action
    drawBoxLeafNode(context, node, 1);

    // result
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });
});
