// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getErasePreviewNodes } from '../getErasePreviewNodes';
import { getVectorFillColorForLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillColorForLoopKey';

const subtractCapsuleFromVectorNetworkMock = vi.fn();
const getRenderedVectorNodeMock = vi.fn();

vi.mock('utils/canvas/vectorNetwork/eraseVectorNetwork/subtractCapsuleFromVectorNetwork/subtractCapsuleFromVectorNetwork', () => ({
  subtractCapsuleFromVectorNetwork: (...args: unknown[]): unknown => subtractCapsuleFromVectorNetworkMock(...args),
}));
vi.mock('components/Design/Canvas/utils/getRenderedVectorNode', () => ({
  getRenderedVectorNode: (...args: unknown[]): unknown => getRenderedVectorNodeMock(...args),
}));

const IDENTITY_VIEWPORT = { x: 0, y: 0, zoom: 1 };

const vectorNode: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'v1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
};

const otherNode: TSceneNode = { ...vectorNode, id: 'v2' };

const createRefs = (strokePath: TPoint[] | null, diameterPx: number): TCanvasRefs =>
  ({
    vectorErase: {
      eraserDiameterRef: { current: diameterPx },
      vectorEraseStrokeRef: { current: strokePath },
    },
  }) as TCanvasRefs;

describe('getErasePreviewNodes', () => {
  beforeEach(() => {
    subtractCapsuleFromVectorNetworkMock.mockReset();
    getRenderedVectorNodeMock.mockReset();
    getRenderedVectorNodeMock.mockImplementation((node: TVectorNode) => node);
  });

  it('should return the nodes untouched when the Erase tool is not active', () => {
    // result
    expect(getErasePreviewNodes([vectorNode], ['v1'], ToolName.cut, createRefs([{ x: 0, y: 0 }], 10), IDENTITY_VIEWPORT)).toEqual([
      vectorNode,
    ]);
    expect(subtractCapsuleFromVectorNetworkMock).not.toHaveBeenCalled();
  });

  it('should return the nodes untouched when there is no stroke in progress', () => {
    // result
    expect(getErasePreviewNodes([vectorNode], ['v1'], ToolName.erase, createRefs(null, 10), IDENTITY_VIEWPORT)).toEqual([vectorNode]);
    expect(getErasePreviewNodes([vectorNode], ['v1'], ToolName.erase, createRefs([], 10), IDENTITY_VIEWPORT)).toEqual([vectorNode]);
  });

  it('should return the nodes untouched when no node is being vector-edited', () => {
    // result
    expect(getErasePreviewNodes([vectorNode], [], ToolName.erase, createRefs([{ x: 0, y: 0 }], 10), IDENTITY_VIEWPORT)).toEqual([
      vectorNode,
    ]);
  });

  it('should leave a non-editing or non-vector node untouched', () => {
    // result
    expect(getErasePreviewNodes([otherNode], ['v1'], ToolName.erase, createRefs([{ x: 0, y: 0 }], 10), IDENTITY_VIEWPORT)).toEqual([
      otherNode,
    ]);
    expect(subtractCapsuleFromVectorNetworkMock).not.toHaveBeenCalled();
  });

  it("should substitute the editing node's live-eroded geometry, baking rotation first, and pin each surviving face to its original color", () => {
    // mock
    const bakedNode = { ...vectorNode, rotation: 0 };
    const erased = {
      fillColorOverrideByKey: { 'new-key': getVectorFillColorForLoopKey('old-key') },
      filledFaceKeys: ['new-key'],
      segments: { s1: {} },
      survivingFaces: [{ key: 'new-key', originalKey: 'old-key' }],
      vertices: { a: {} },
    };

    getRenderedVectorNodeMock.mockReturnValue(bakedNode);
    subtractCapsuleFromVectorNetworkMock.mockReturnValue(erased);

    // before
    const result = getErasePreviewNodes([vectorNode, otherNode], ['v1'], ToolName.erase, createRefs([{ x: 5, y: 5 }], 20), {
      x: 0,
      y: 0,
      zoom: 2,
    });

    // result — radius = 20 / 2 / 2 = 5; the new key is pinned to the old key's own color, not its own
    expect(getRenderedVectorNodeMock).toHaveBeenCalledWith(vectorNode);
    expect(subtractCapsuleFromVectorNetworkMock).toHaveBeenCalledWith(bakedNode, [{ x: 5, y: 5 }], 5);
    expect(result).toEqual([{ ...bakedNode, ...erased }, otherNode]);
  });

  it('should fall back to the real node when the stroke misses every segment of it', () => {
    // mock
    getRenderedVectorNodeMock.mockReturnValue(vectorNode);
    subtractCapsuleFromVectorNetworkMock.mockReturnValue(null);

    // result
    expect(getErasePreviewNodes([vectorNode], ['v1'], ToolName.erase, createRefs([{ x: 500, y: 500 }], 10), IDENTITY_VIEWPORT)).toEqual([
      vectorNode,
    ]);
  });
});
