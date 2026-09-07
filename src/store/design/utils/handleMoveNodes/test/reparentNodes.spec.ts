// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../../types';
import { TRectangleNode } from 'types/design/types';

// utils
import { reparentNodes } from '../reparentNodes';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fill: '#000',
  height: 10,
  id: 'a',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const page = (nodes: Record<string, TRectangleNode>): TDesignPage => ({
  backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  comments: {},
  guides: [],
  id: 'page-1',
  name: 'Page 1',
  nodes,
  paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

describe('reparentNodes', () => {
  it('should write the new parentId for every moved node', () => {
    // mock
    const designPage = page({ a: rect({ id: 'a', parentId: 'old' }), b: rect({ id: 'b', parentId: 'old' }) });

    // action
    reparentNodes(designPage, ['a', 'b'], 'new', true);

    // result
    expect(designPage.nodes.a.parentId).toBe('new');
    expect(designPage.nodes.b.parentId).toBe('new');
  });

  it('should clear ignoreAutoLayout when reparenting to a different parent', () => {
    // mock
    const designPage = page({ a: rect({ id: 'a', ignoreAutoLayout: true, parentId: 'old' }) });

    // action
    reparentNodes(designPage, ['a'], 'new', true);

    // result
    expect((designPage.nodes.a as TRectangleNode).ignoreAutoLayout).toBeUndefined();
  });

  it('should keep ignoreAutoLayout when not actually reparenting (same-parent reorder)', () => {
    // mock
    const designPage = page({ a: rect({ id: 'a', ignoreAutoLayout: true, parentId: 'same' }) });

    // action
    reparentNodes(designPage, ['a'], 'same', false);

    // result
    expect((designPage.nodes.a as TRectangleNode).ignoreAutoLayout).toBe(true);
  });

  it('should tolerate a nodeId that no longer resolves to a node', () => {
    // mock
    const designPage = page({ a: rect() });

    // action & result — should not throw, and should still reparent the id that does resolve
    expect(() => reparentNodes(designPage, ['a', 'gone'], 'new', true)).not.toThrow();
    expect(designPage.nodes.a.parentId).toBe('new');
  });
});
