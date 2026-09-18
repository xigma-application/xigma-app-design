// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';
import { TPaint } from 'types/design/paint/types';

// utils
import { getContrastBackgroundColor } from '../getContrastBackgroundColor';

const PAGE_BACKGROUND = '#f5f5f5';

const rect = (id: string, parentId: string | null = null): TRectangleNode => ({
  fills: [{ color: '#111111', opacity: 100, type: 'solid' }],
  height: 10,
  id,
  name: 'Rectangle',
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
});

const frame = (id: string, fills: TPaint[], parentId: string | null = null): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fills,
  height: 10,
  id,
  name: 'Frame',
  parentId,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
});

const section = (id: string, fill: string, parentId: string | null = null): TSectionNode => ({
  childIds: [],
  fill,
  height: 10,
  id,
  name: 'Section',
  parentId,
  rotation: 0,
  type: NodeType.section,
  width: 10,
  x: 0,
  y: 0,
});

describe('getContrastBackgroundColor', () => {
  it('should fall back to the page background when the node has no parent', () => {
    const nodesById: Record<string, TSceneNode> = { a: rect('a') };

    expect(getContrastBackgroundColor('a', nodesById, PAGE_BACKGROUND)).toBe(PAGE_BACKGROUND);
  });

  it("should use the parent frame's opaque solid fill", () => {
    const nodesById: Record<string, TSceneNode> = {
      a: rect('a', 'f'),
      f: frame('f', [{ color: '#ff0000', opacity: 100, type: 'solid' }]),
    };

    expect(getContrastBackgroundColor('a', nodesById, PAGE_BACKGROUND)).toBe('#ff0000');
  });

  it('should never use the node’s own fill as its own background', () => {
    const nodesById: Record<string, TSceneNode> = { a: rect('a') };

    expect(getContrastBackgroundColor('a', nodesById, PAGE_BACKGROUND)).not.toBe('#111111');
  });

  it('should walk past a frame with no usable solid fill to the next ancestor', () => {
    const nodesById: Record<string, TSceneNode> = {
      a: rect('a', 'inner'),
      inner: frame('inner', [{ color: '#00ff00', opacity: 50, type: 'solid' }], 'outer'),
      outer: frame('outer', [{ color: '#0000ff', opacity: 100, type: 'solid' }]),
    };

    expect(getContrastBackgroundColor('a', nodesById, PAGE_BACKGROUND)).toBe('#0000ff');
  });

  it('should stop at the nearest usable ancestor, not the outermost one', () => {
    const nodesById: Record<string, TSceneNode> = {
      a: rect('a', 'inner'),
      inner: frame('inner', [{ color: '#00ff00', opacity: 100, type: 'solid' }], 'outer'),
      outer: frame('outer', [{ color: '#0000ff', opacity: 100, type: 'solid' }]),
    };

    expect(getContrastBackgroundColor('a', nodesById, PAGE_BACKGROUND)).toBe('#00ff00');
  });

  it('should fall back to the page background when every ancestor is non-solid or transparent', () => {
    const nodesById: Record<string, TSceneNode> = {
      a: rect('a', 'f'),
      f: frame('f', [{ opacity: 100, ref: 'asset', rotation: 0, scaleMode: 'fill', type: 'image' }]),
    };

    expect(getContrastBackgroundColor('a', nodesById, PAGE_BACKGROUND)).toBe(PAGE_BACKGROUND);
  });

  it("should use a parent section's plain fill color", () => {
    const nodesById: Record<string, TSceneNode> = {
      a: rect('a', 's'),
      s: section('s', '#abcdef'),
    };

    expect(getContrastBackgroundColor('a', nodesById, PAGE_BACKGROUND)).toBe('#abcdef');
  });

  it('should fall back to the page background when the node id is undefined', () => {
    expect(getContrastBackgroundColor(undefined, {}, PAGE_BACKGROUND)).toBe(PAGE_BACKGROUND);
  });
});
