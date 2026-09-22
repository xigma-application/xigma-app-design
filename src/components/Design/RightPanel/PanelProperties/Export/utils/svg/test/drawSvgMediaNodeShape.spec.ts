// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TMediaNode } from 'types/design/types';

// utils
import { drawSvgMediaNodeShape } from '../drawSvgMediaNodeShape';

const loadSvgImageAssetMock = vi.fn();
const getSvgRotateTransformValueMock = vi.fn();

vi.mock('../loadSvgImageAsset', () => ({ loadSvgImageAsset: (...args: unknown[]): unknown => loadSvgImageAssetMock(...args) }));
vi.mock('../getSvgRotateTransformValue', () => ({
  getSvgRotateTransformValue: (...args: unknown[]): unknown => getSvgRotateTransformValueMock(...args),
}));

const bounds = { height: 100, width: 100, x: 10, y: 10 };

const node: TMediaNode = {
  flipX: false,
  flipY: false,
  height: 20,
  id: 'm',
  name: 'm',
  parentId: null,
  rotation: 0,
  src: 's',
  type: NodeType.media,
  width: 40,
  x: 15,
  y: 20,
};

describe('drawSvgMediaNodeShape', () => {
  beforeEach(() => {
    loadSvgImageAssetMock.mockReset();
    getSvgRotateTransformValueMock.mockReset();
    getSvgRotateTransformValueMock.mockReturnValue('');
  });

  it('should draw nothing when the asset fails to load', async () => {
    loadSvgImageAssetMock.mockResolvedValue(null);

    const elements: string[] = [];

    await drawSvgMediaNodeShape(elements, node, {}, bounds);

    expect(elements).toEqual([]);
  });

  it('should load the asset with the node src, no orientation rotation, and its own flip', async () => {
    loadSvgImageAssetMock.mockResolvedValue(null);

    await drawSvgMediaNodeShape([], { ...node, flipX: true, flipY: true, src: 'ref' }, {}, bounds);

    expect(loadSvgImageAssetMock).toHaveBeenCalledWith('ref', 0, true, true);
  });

  it('should draw a full-stretch image (preserveAspectRatio none) at the node rect, in page coordinates', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 1, width: 1 });

    const elements: string[] = [];

    await drawSvgMediaNodeShape(elements, node, {}, bounds);

    expect(elements).toHaveLength(1);
    expect(elements[0]).toBe('<image href="data:image/png;base64,AAAA" x="5" y="10" width="40" height="20" preserveAspectRatio="none"/>');
  });

  it('should add a rotate transform when the node is rotated', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 1, width: 1 });
    getSvgRotateTransformValueMock.mockReturnValue('rotate(15 25 20)');

    const elements: string[] = [];

    await drawSvgMediaNodeShape(elements, { ...node, rotation: 15 }, {}, bounds);

    expect(getSvgRotateTransformValueMock).toHaveBeenCalledWith(15, { height: 20, width: 40, x: 15, y: 20 }, bounds);
    expect(elements[0]).toContain('transform="rotate(15 25 20)"');
  });

  it('should multiply in the inherited ancestor opacity', async () => {
    loadSvgImageAssetMock.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAAA', height: 1, width: 1 });

    const parent: TFrameNode = {
      childIds: ['m'],
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
    const elements: string[] = [];

    await drawSvgMediaNodeShape(elements, { ...node, parentId: 'p' }, { p: parent }, bounds);

    expect(elements[0]).toContain('opacity="0.5"');
  });
});
