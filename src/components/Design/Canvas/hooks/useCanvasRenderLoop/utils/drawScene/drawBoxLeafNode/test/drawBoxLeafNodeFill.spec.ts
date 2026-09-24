// types
import { NodeType } from 'types/design/enums';
import { TDrawSceneContext } from '../../types';
import { TRectangleNode, TSectionNode } from 'types/design/types';

// utils
import { getFaceBufferCache } from 'utils/canvas/faceBufferCache/getFaceBufferCache';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';
import { drawBoxLeafNodeFill } from '../drawBoxLeafNodeFill';

const drawBoxPaintsMock = vi.fn();
const drawRectMock = vi.fn();
const getBoxFillPolygonMock = vi.fn();

vi.mock('../drawBoxPaints', () => ({ drawBoxPaints: (...args: unknown[]): void => drawBoxPaintsMock(...args) }));
vi.mock('utils/canvas/drawRect/drawRect', () => ({ drawRect: (...args: unknown[]): void => drawRectMock(...args) }));
vi.mock('../../getBoxFillPolygon', () => ({ getBoxFillPolygon: (...args: unknown[]): unknown => getBoxFillPolygonMock(...args) }));

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
const refs = createCanvasRefs();

describe('drawBoxLeafNodeFill', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBoxFillPolygonMock.mockReturnValue([{ x: 0, y: 0 }]);
  });

  it('should draw the node fills through the shared paint stack with the fill polygon', () => {
    // mock
    const node: TRectangleNode = {
      fills: [{ color: '#fff', opacity: 100, type: 'solid' }],
      height: 20,
      id: 'r1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 0,
      y: 0,
    };

    // action
    drawBoxLeafNodeFill(context, node, 0.5, {}, new Map(), refs, null, 0);

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledWith(
      context,
      node,
      node.fills,
      [[{ x: 0, y: 0 }]],
      0.5,
      {},
      expect.any(Map),
      refs,
      null,
      0,
      getFaceBufferCache(context.gl),
    );
    expect(drawRectMock).not.toHaveBeenCalled();
  });

  it('should draw a section with the plain-color rect path', () => {
    // mock
    const node: TSectionNode = {
      childIds: [],
      fill: '#abc',
      height: 20,
      id: 's1',
      name: 'Section',
      parentId: null,
      rotation: 0,
      type: NodeType.section,
      width: 20,
      x: 0,
      y: 0,
    };

    // action
    drawBoxLeafNodeFill(context, node, 0.5, {}, new Map(), refs, null, 0);

    // result
    expect(drawRectMock).toHaveBeenCalledWith(
      context.gl,
      context.program,
      context.buffer,
      { ...node, fillAlpha: 0.5 },
      200,
      150,
      viewport,
      0,
    );
    expect(drawBoxPaintsMock).not.toHaveBeenCalled();
  });
});
