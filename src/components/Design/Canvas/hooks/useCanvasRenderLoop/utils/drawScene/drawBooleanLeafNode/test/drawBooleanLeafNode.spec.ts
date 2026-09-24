// types
import { BooleanOperation, EffectType, NodeType } from 'types/design/enums';
import { TBooleanNode, TVectorNode } from 'types/design/types';
import { TDrawSceneContext } from '../../types';

// utils
import { booleanShape } from './fixtures';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { drawBooleanLeafNode } from '../drawBooleanLeafNode';

const calls: string[] = [];
const vector = { filledFaceKeys: ['f'], segments: {}, type: NodeType.vector } as unknown as TVectorNode;
const getBooleanVectorNodeMock = vi.fn((): TVectorNode | null => vector);
const drawBoxPaintsMock = vi.fn((...args: unknown[]) => calls.push(`fill:${args.length}`));

vi.mock('utils/canvas/booleanOperation/getBooleanVectorNode', () => ({
  getBooleanVectorNode: (): TVectorNode | null => getBooleanVectorNodeMock(),
}));
vi.mock('../getBooleanShape', () => ({ getBooleanShape: (): unknown => booleanShape }));
vi.mock('../drawBooleanEffects', () => ({
  drawBooleanEffects: (...args: unknown[]): number => calls.push(args[5] as string),
}));
vi.mock('../../drawBoxLeafNode/drawBoxPaints', () => ({
  drawBoxPaints: (...args: unknown[]): number => drawBoxPaintsMock(...args),
}));
vi.mock('../../drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorNode', () => ({
  drawVectorNode: (_context: unknown, outline: TVectorNode): number => calls.push(`stroke:${outline.filledFaceKeys.length}`),
}));
vi.mock('utils/canvas/faceBufferCache/getFaceBufferCache', () => ({ getFaceBufferCache: (): unknown => ({ tag: 'faces' }) }));

const node: TBooleanNode = {
  booleanOperation: BooleanOperation.union,
  childIds: [],
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 10,
  id: 'union',
  name: 'Union',
  parentId: null,
  rotation: 0,
  type: NodeType.boolean,
  width: 10,
  x: 0,
  y: 0,
};

describe('drawBooleanLeafNode', () => {
  beforeEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
  });

  it('should draw drop shadows, the fills, inner shadows, the stroke and the noise in that order', () => {
    // action
    drawBooleanLeafNode({ gl: {} } as TDrawSceneContext, node, 1, {}, new Map(), createCanvasRefs(), null, 0);

    // result
    expect(calls).toEqual([EffectType.dropShadow, 'fill:11', EffectType.innerShadow, 'stroke:0', EffectType.noise]);
  });

  it('should paint the fills over the shape polygons within its unrotated bounds with the node opacity', () => {
    // mock
    const context = { gl: {} } as TDrawSceneContext;

    // action
    drawBooleanLeafNode(context, node, 0.5, {}, new Map(), createCanvasRefs(), null, 2);

    // result
    expect(drawBoxPaintsMock).toHaveBeenCalledWith(
      context,
      { ...booleanShape.bounds, rotation: 0 },
      node.fills,
      booleanShape.polygons,
      0.5,
      {},
      expect.any(Map),
      expect.anything(),
      null,
      2,
      { tag: 'faces' },
    );
  });

  it('should draw nothing without a result', () => {
    // mock
    getBooleanVectorNodeMock.mockReturnValueOnce(null);

    // action
    drawBooleanLeafNode({ gl: {} } as TDrawSceneContext, node, 1, {}, new Map(), createCanvasRefs(), null, 0);

    // result
    expect(calls).toEqual([]);
  });
});
