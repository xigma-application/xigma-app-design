// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getFrameGuideLines } from '../getFrameGuideLines';

const frame = (id: string, overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  height: 100,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 200,
  x: 10,
  y: 20,
  ...overrides,
});

describe('getFrameGuideLines', () => {
  it("should convert a frame's vertical (x-axis) guide to a world-space line spanning its height", () => {
    // mock
    const nodes = { frame: { ...frame('frame'), guides: [{ axis: 'x' as const, id: 'guide-1', position: 30 }] } };

    // result
    expect(getFrameGuideLines(nodes)).toEqual([
      { axis: 'x', frameId: 'frame', id: 'guide-1', span: { from: 20, to: 120 }, worldPosition: 40 },
    ]);
  });

  it("should convert a frame's horizontal (y-axis) guide to a world-space line spanning its width", () => {
    // mock
    const nodes = { frame: { ...frame('frame'), guides: [{ axis: 'y' as const, id: 'guide-1', position: 5 }] } };

    // result
    expect(getFrameGuideLines(nodes)).toEqual([
      { axis: 'y', frameId: 'frame', id: 'guide-1', span: { from: 10, to: 210 }, worldPosition: 25 },
    ]);
  });

  it('should skip a rotated frame', () => {
    // mock
    const nodes = { frame: { ...frame('frame', { rotation: 45 }), guides: [{ axis: 'x' as const, id: 'guide-1', position: 30 }] } };

    // result
    expect(getFrameGuideLines(nodes)).toEqual([]);
  });

  it('should skip a frame with no guides', () => {
    // mock
    const nodes = { frame: frame('frame') };

    // result
    expect(getFrameGuideLines(nodes)).toEqual([]);
  });

  it('should skip non-frame nodes', () => {
    // mock
    const nodes: Record<string, TSceneNode> = { rect: { ...frame('rect'), type: NodeType.rectangle } };

    // result
    expect(getFrameGuideLines(nodes)).toEqual([]);
  });

  it('should hand back the very same lines when only a non-frame node changed', () => {
    // mock
    const rectangle = (x: number): TSceneNode => ({ id: 'r', type: NodeType.rectangle, x }) as unknown as TSceneNode;
    const guided = { ...frame('guided'), guides: [{ axis: 'x' as const, id: 'g', position: 1 }] };
    const first = { guided, r: rectangle(0) };
    const second = { guided, r: rectangle(5) };

    // before
    const lines = getFrameGuideLines(first);

    // result
    expect(getFrameGuideLines(second)).toBe(lines);
    expect(getFrameGuideLines(second)).toBe(lines);
  });

  it('should recompute when a frame changed', () => {
    // mock
    const first = { guided: { ...frame('guided'), guides: [{ axis: 'x' as const, id: 'g', position: 1 }] } };
    const second = { guided: { ...frame('guided'), guides: [{ axis: 'x' as const, id: 'g', position: 9 }] } };

    // before
    const lines = getFrameGuideLines(first);

    // result
    expect(getFrameGuideLines(second)).not.toBe(lines);
    expect(getFrameGuideLines(second)[0].worldPosition).toBe(19);
  });

  it('should recompute when too many nodes changed to track', () => {
    // mock
    const many = (x: number): Record<string, TSceneNode> =>
      Object.fromEntries(
        Array.from({ length: 100 }, (_, index) => [`n${index}`, { id: `n${index}`, type: NodeType.rectangle, x } as unknown as TSceneNode]),
      );
    const lines = getFrameGuideLines(many(0));

    // result
    expect(getFrameGuideLines(many(1))).not.toBe(lines);
  });
});
