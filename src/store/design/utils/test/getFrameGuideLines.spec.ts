// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getFrameGuideLines } from '../getFrameGuideLines';

const frame = (id: string, overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  fill: '#ff0000',
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
});
