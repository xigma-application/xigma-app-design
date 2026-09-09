// types
import { CanvasStacking, NodeType } from 'types/design/enums';
import { TEllipseNode, TFrameNode, TGroupNode, TSceneNode } from 'types/design/types';

// utils
import { getRenderOrderedNodes } from '../getRenderOrderedNodes';

const leaf = (id: string, overrides: Partial<TEllipseNode> = {}): TEllipseNode => ({
  fill: '#fff',
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const frame = (id: string, overrides: Partial<TFrameNode> = {}): TFrameNode => ({
  childIds: [],
  clipContent: false,
  fill: '#fff',
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const group = (id: string, overrides: Partial<TGroupNode> = {}): TGroupNode => ({
  childIds: [],
  height: 10,
  id,
  name: id,
  parentId: null,
  rotation: 0,
  type: NodeType.group,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const toRecord = (nodes: TSceneNode[]): Record<string, TSceneNode> => Object.fromEntries(nodes.map((node) => [node.id, node]));

describe('getRenderOrderedNodes', () => {
  it('should flatten multiple roots in root order', () => {
    const nodes = toRecord([leaf('a'), leaf('b')]);

    expect(getRenderOrderedNodes(['a', 'b'], nodes).map((node) => node.id)).toEqual(['a', 'b']);
  });

  it('should list a container before its children, in childIds order by default', () => {
    const nodes = toRecord([frame('f', { childIds: ['a', 'b'] }), leaf('a'), leaf('b')]);

    expect(getRenderOrderedNodes(['f'], nodes).map((node) => node.id)).toEqual(['f', 'a', 'b']);
  });

  it('should reverse only the frame children order when the frame is set to first on top', () => {
    const nodes = toRecord([
      frame('f', { canvasStacking: CanvasStacking.firstOnTop, childIds: ['a', 'b', 'c'] }),
      leaf('a'),
      leaf('b'),
      leaf('c'),
    ]);

    expect(getRenderOrderedNodes(['f'], nodes).map((node) => node.id)).toEqual(['f', 'c', 'b', 'a']);
  });

  it('should not reverse a group even if it were flagged, since canvas stacking only applies to frames', () => {
    const nodes = toRecord([group('g', { childIds: ['a', 'b'] }), leaf('a'), leaf('b')]);

    expect(getRenderOrderedNodes(['g'], nodes).map((node) => node.id)).toEqual(['g', 'a', 'b']);
  });

  it('should recurse through nested containers, applying first-on-top only to the frame that has it', () => {
    const nodes = toRecord([
      frame('outer', { childIds: ['inner'] }),
      frame('inner', { canvasStacking: CanvasStacking.firstOnTop, childIds: ['a', 'b'] }),
      leaf('a'),
      leaf('b'),
    ]);

    expect(getRenderOrderedNodes(['outer'], nodes).map((node) => node.id)).toEqual(['outer', 'inner', 'b', 'a']);
  });

  it('should skip a childId that has no matching node', () => {
    const nodes = toRecord([frame('f', { childIds: ['missing', 'a'] }), leaf('a')]);

    expect(getRenderOrderedNodes(['f'], nodes).map((node) => node.id)).toEqual(['f', 'a']);
  });

  it('should skip a rootOrder id that has no matching node', () => {
    const nodes = toRecord([leaf('a')]);

    expect(getRenderOrderedNodes(['missing', 'a'], nodes).map((node) => node.id)).toEqual(['a']);
  });
});
