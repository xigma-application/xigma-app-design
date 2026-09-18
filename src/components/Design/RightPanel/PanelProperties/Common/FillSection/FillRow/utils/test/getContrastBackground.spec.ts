// types
import { BlendMode, NodeType } from 'types/design/enums';
import { TFrameNode, TRectangleNode, TSceneNode, TSectionNode } from 'types/design/types';
import { TPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { getContrastBackground } from '../getContrastBackground';

const PAGE: TSolidPaint = { color: '#f5f5f5', opacity: 100, type: 'solid' };

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

const frame = (id: string, fills: TPaint[], parentId: string | null = null, blendMode?: BlendMode): TFrameNode => ({
  blendMode,
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

const solid = (color: string, opacity = 100, extra: Partial<TSolidPaint> = {}): TSolidPaint => ({
  color,
  opacity,
  type: 'solid',
  ...extra,
});

describe('getContrastBackground', () => {
  it('should fall back to the page background when the node has no parent', () => {
    expect(getContrastBackground('a', { a: rect('a') }, PAGE)).toEqual({ color: '#f5f5f5' });
  });

  it('should fall back to the page background when the node id is undefined', () => {
    expect(getContrastBackground(undefined, {}, PAGE)).toEqual({ color: '#f5f5f5' });
  });

  it("should use the parent frame's solid fill", () => {
    const nodes: Record<string, TSceneNode> = { a: rect('a', 'f'), f: frame('f', [solid('#ff0000')]) };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ color: '#ff0000' });
  });

  it('should never use the node’s own fill as its own background', () => {
    expect(getContrastBackground('a', { a: rect('a') }, PAGE)).not.toEqual({ color: '#111111' });
  });

  it('should pick the fill with the highest opacity among several fills', () => {
    const nodes: Record<string, TSceneNode> = { a: rect('a', 'f'), f: frame('f', [solid('#ff0000', 20), solid('#ffffff', 50)]) };

    expect(getContrastBackground('a', nodes, solid('#000000'))).toEqual({ color: '#808080' });
  });

  it('should prefer the higher fill in the list when opacities tie', () => {
    const nodes: Record<string, TSceneNode> = { a: rect('a', 'f'), f: frame('f', [solid('#ff0000'), solid('#00ff00')]) };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ color: '#ff0000' });
  });

  it('should blend a semi-transparent solid over the ancestor beneath it', () => {
    const nodes: Record<string, TSceneNode> = {
      a: rect('a', 'inner'),
      inner: frame('inner', [solid('#ffffff', 50)], 'outer'),
      outer: frame('outer', [solid('#000000')]),
    };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ color: '#808080' });
  });

  it('should blend a semi-transparent solid over the page background when nothing is beneath it', () => {
    const nodes: Record<string, TSceneNode> = { a: rect('a', 'f'), f: frame('f', [solid('#000000', 50)]) };

    expect(getContrastBackground('a', nodes, solid('#ffffff'))).toEqual({ color: '#808080' });
  });

  it('should skip a parent whose fills are all hidden and use the next ancestor', () => {
    const nodes: Record<string, TSceneNode> = {
      a: rect('a', 'inner'),
      inner: frame('inner', [solid('#00ff00', 100, { visible: false })], 'outer'),
      outer: frame('outer', [solid('#0000ff')]),
    };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ color: '#0000ff' });
  });

  it('should skip a parent with no fills at all', () => {
    const nodes: Record<string, TSceneNode> = {
      a: rect('a', 'inner'),
      inner: frame('inner', [], 'outer'),
      outer: frame('outer', [solid('#0000ff')]),
    };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ color: '#0000ff' });
  });

  it("should use a parent section's plain fill color", () => {
    const nodes: Record<string, TSceneNode> = { a: rect('a', 's'), s: section('s', '#abcdef') };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ color: '#abcdef' });
  });

  it('should block with the blend-mode reason when the parent has a blend mode in appearance', () => {
    const nodes: Record<string, TSceneNode> = { a: rect('a', 'f'), f: frame('f', [solid('#ff0000')], null, BlendMode.multiply) };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ reason: 'backgroundBlendMode' });
  });

  it('should block with the blend-mode reason when a distant ancestor has a blend mode', () => {
    const nodes: Record<string, TSceneNode> = {
      a: rect('a', 'b'),
      b: frame('b', [solid('#ff0000')], 'top'),
      top: frame('top', [solid('#0000ff')], null, BlendMode.multiply),
    };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ reason: 'backgroundBlendMode' });
  });

  it('should block with the blend-mode reason when the chosen fill has a blend mode', () => {
    const nodes: Record<string, TSceneNode> = {
      a: rect('a', 'f'),
      f: frame('f', [solid('#ff0000', 100, { blendMode: BlendMode.multiply })]),
    };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ reason: 'backgroundBlendMode' });
  });

  it('should ignore a blend mode on a fill that is not the chosen one', () => {
    const nodes: Record<string, TSceneNode> = {
      a: rect('a', 'f'),
      f: frame('f', [solid('#ff0000', 20, { blendMode: BlendMode.multiply }), solid('#00ff00', 50)]),
    };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ color: '#7bfa7b' });
  });

  it.each([
    [{ opacity: 100, ref: 'asset', rotation: 0, scaleMode: 'fill', type: 'image' }, 'imageBackground'],
    [{ opacity: 100, ref: 'asset', type: 'video' }, 'videoBackground'],
  ] as const)('should block with a type-specific reason for a non-solid chosen fill (%#)', (paint, reason) => {
    const nodes: Record<string, TSceneNode> = { a: rect('a', 'f'), f: frame('f', [paint as unknown as TPaint]) };

    expect(getContrastBackground('a', nodes, PAGE)).toEqual({ reason });
  });

  it('should block with the mixed reason when the page background is hidden', () => {
    expect(getContrastBackground('a', { a: rect('a') }, solid('#ffffff', 100, { visible: false }))).toEqual({ reason: 'mixedBackground' });
  });

  it('should block with the mixed reason when the page background has zero opacity', () => {
    expect(getContrastBackground('a', { a: rect('a') }, solid('#ffffff', 0))).toEqual({ reason: 'mixedBackground' });
  });
});
