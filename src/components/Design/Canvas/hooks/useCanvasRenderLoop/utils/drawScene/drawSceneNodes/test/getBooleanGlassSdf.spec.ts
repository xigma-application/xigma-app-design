// types
import { BooleanOperation, NodeType } from 'types/design/enums';
import { TBooleanNode, TVectorNode } from 'types/design/types';
import { TMaskRenderer } from '../types';

// utils
import { getBooleanGlassSdf } from '../getBooleanGlassSdf';

const shapes = [
  { bounds: { height: 10, width: 10, x: 0, y: 0 }, key: 1, polygons: [] },
  { bounds: { height: 20, width: 20, x: 0, y: 0 }, key: 2, polygons: [] },
];
const getBooleanVectorNodeMock = vi.fn((): TVectorNode | null => ({}) as TVectorNode);
const getBooleanShapeMock = vi.fn(() => shapes[0]);
const createShapeSdfTextureMock = vi.fn(() => ({ tag: `sdf-${createShapeSdfTextureMock.mock.calls.length}` }));

vi.mock('utils/canvas/booleanOperation/getBooleanVectorNode', () => ({
  getBooleanVectorNode: (): TVectorNode | null => getBooleanVectorNodeMock(),
}));
vi.mock('../../drawBooleanLeafNode/getBooleanShape', () => ({ getBooleanShape: (): unknown => getBooleanShapeMock() }));
vi.mock('utils/canvas/shapeSdf/computeShapeSdf', () => ({
  computeShapeSdf: (): unknown => ({ cellSize: 2, height: 5, origin: { x: -8, y: -8 }, values: new Float32Array(), width: 6 }),
}));
vi.mock('utils/canvas/shapeSdf/createShapeSdfTexture', () => ({ createShapeSdfTexture: (): unknown => createShapeSdfTextureMock() }));

const node = {
  booleanOperation: BooleanOperation.union,
  childIds: [],
  id: 'glassUnion',
  type: NodeType.boolean,
} as unknown as TBooleanNode;

describe('getBooleanGlassSdf', () => {
  it('should build the distance texture once per shape and replace it when the shape changes', () => {
    // mock
    const renderer = { gl: { deleteTexture: vi.fn() }, nodesById: {}, sceneNodeById: new Map() } as unknown as TMaskRenderer;

    // action
    const first = getBooleanGlassSdf(renderer, node);
    const second = getBooleanGlassSdf(renderer, node);

    getBooleanShapeMock.mockReturnValue(shapes[1]);

    const third = getBooleanGlassSdf(renderer, node);

    // result
    expect(first).toMatchObject({ bounds: shapes[0].bounds, origin: { x: -8, y: -8 }, size: { height: 10, width: 12 } });
    expect(second?.texture).toBe(first?.texture);
    expect(renderer.gl.deleteTexture).toHaveBeenCalledWith(first?.texture);
    expect(third?.bounds).toBe(shapes[1].bounds);
    expect(createShapeSdfTextureMock).toHaveBeenCalledTimes(2);
  });

  it('should return null without a boolean result', () => {
    // mock
    getBooleanVectorNodeMock.mockReturnValueOnce(null);

    // action / result
    expect(getBooleanGlassSdf({ gl: {}, sceneNodeById: new Map() } as unknown as TMaskRenderer, node)).toBeNull();
  });
});
