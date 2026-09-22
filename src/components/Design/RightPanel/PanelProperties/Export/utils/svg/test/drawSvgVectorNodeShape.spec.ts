// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TVectorNode } from 'types/design/types';

// utils
import { drawSvgVectorNodeShape } from '../drawSvgVectorNodeShape';

const drawSvgVectorFillsMock = vi.fn();
const drawSvgVectorStrokeMock = vi.fn();
const drawSvgVectorRoundedCapsMock = vi.fn();

vi.mock('../drawSvgVectorFills', () => ({ drawSvgVectorFills: (...args: unknown[]): void => drawSvgVectorFillsMock(...args) }));
vi.mock('../drawSvgVectorStroke', () => ({ drawSvgVectorStroke: (...args: unknown[]): void => drawSvgVectorStrokeMock(...args) }));
vi.mock('../drawSvgVectorRoundedCaps', () => ({
  drawSvgVectorRoundedCaps: (...args: unknown[]): void => drawSvgVectorRoundedCapsMock(...args),
}));

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const node: TVectorNode = {
  defaultFill: null,
  filledFaceKeys: [],
  id: 'v',
  name: 'v',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '',
  strokeWidth: 0,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

describe('drawSvgVectorNodeShape', () => {
  beforeEach(() => {
    drawSvgVectorFillsMock.mockClear();
    drawSvgVectorStrokeMock.mockClear();
    drawSvgVectorRoundedCapsMock.mockClear();
  });

  it('should draw fills, stroke and rounded caps in order with the effective opacity', () => {
    // action
    const elements: string[] = [];
    const defs: string[] = [];

    drawSvgVectorNodeShape(elements, defs, node, {}, bounds);

    // result
    expect(drawSvgVectorFillsMock).toHaveBeenCalledWith(elements, defs, node, 1, bounds);
    expect(drawSvgVectorStrokeMock).toHaveBeenCalledWith(elements, node, 1, bounds);
    expect(drawSvgVectorRoundedCapsMock).toHaveBeenCalledWith(elements, node, 1, bounds);
  });

  it('should multiply in the inherited ancestor opacity', () => {
    // mock
    const parent: TFrameNode = {
      childIds: ['v'],
      clipContent: false,
      fills: [],
      height: 100,
      id: 'p',
      name: 'p',
      opacity: 0.5,
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: 100,
      x: 0,
      y: 0,
    };

    // action
    drawSvgVectorNodeShape([], [], { ...node, parentId: 'p' }, { p: parent }, bounds);

    // result
    expect(drawSvgVectorFillsMock.mock.calls[0][3]).toBeCloseTo(0.5);
  });
});
