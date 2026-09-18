// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { drawBoxLeafNodeStroke } from '../drawBoxLeafNodeStroke';

const drawThickOutlineMock = vi.fn();

vi.mock('utils/canvas/drawThickOutline/drawThickOutline', () => ({
  drawThickOutline: (...args: unknown[]): void => drawThickOutlineMock(...args),
}));

const viewport = { x: 0, y: 0, zoom: 1 };
const context = {
  buffer: {},
  canvasHeight: 150,
  canvasWidth: 200,
  gl: {},
  imageContext: {},
  program: {},
  viewport,
} as unknown as TDrawSceneContext;
const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
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

describe('drawBoxLeafNodeStroke', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should draw the legacy solid outline forwarding width, rotation, alignment and opacity', () => {
    // mock
    const node = rect({ rotation: 15, strokeAlign: StrokeAlign.inside, strokeColor: '#f00', strokeWidth: 3 });

    // action
    drawBoxLeafNodeStroke(context, node, 0.5);

    // result
    expect(drawThickOutlineMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      node,
      '#f00',
      3,
      200,
      150,
      viewport,
      15,
      StrokeAlign.inside,
      0.5,
    );
  });

  it('should skip the outline without a color or without a width', () => {
    // action
    drawBoxLeafNodeStroke(context, rect({ strokeWidth: 3 }), 1);
    drawBoxLeafNodeStroke(context, rect({ strokeColor: '#f00' }), 1);

    // result
    expect(drawThickOutlineMock).not.toHaveBeenCalled();
  });
});
