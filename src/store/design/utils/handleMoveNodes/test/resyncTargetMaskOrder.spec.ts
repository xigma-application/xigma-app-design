// types
import { NodeType } from 'types/design/enums';
import { TDesignPage } from '../../../types';
import { TFrameNode, TGroupNode, TMaskNode, TRectangleNode } from 'types/design/types';

// utils
import { resyncTargetMaskOrder } from '../resyncTargetMaskOrder';

const buildPage = (overrides: Partial<TDesignPage>): TDesignPage => ({
  backgroundPaint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  comments: {},
  guides: [],
  id: 'page-1',
  name: 'Page 1',
  nodes: {},
  paint: { color: '#d9d9d9', opacity: 100, type: 'solid' },
  rootOrder: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});

const buildRect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#000',
  height: 10,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildFrame = (overrides: Partial<TFrameNode>): TFrameNode => ({
  childIds: [],
  clipContent: true,
  fill: '#fff',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

const buildMask = (overrides: Partial<TMaskNode>): TMaskNode => ({
  childIds: [],
  height: 10,
  id: 'mask-1',
  name: 'Mask group',
  parentId: null,
  rotation: 0,
  type: NodeType.mask,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('resyncTargetMaskOrder', () => {
  it('should push a layout container off the last (mask) slot of a mask target', () => {
    // mock
    const b = buildRect({ id: 'b', parentId: 'mask-1' });
    const frame = buildFrame({ id: 'frame-1', parentId: 'mask-1' });
    const mask = buildMask({ childIds: ['b', 'frame-1'], id: 'mask-1' });
    const page = buildPage({ nodes: { b, 'frame-1': frame, 'mask-1': mask } });

    // action
    resyncTargetMaskOrder(page, 'mask-1');

    // result
    expect((page.nodes['mask-1'] as TMaskNode).childIds).toEqual(['frame-1', 'b']);
  });

  it('should leave a mask target untouched when the last child is not a layout container', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'mask-1' });
    const b = buildRect({ id: 'b', parentId: 'mask-1' });
    const mask = buildMask({ childIds: ['a', 'b'], id: 'mask-1' });
    const page = buildPage({ nodes: { a, b, 'mask-1': mask } });

    // action
    resyncTargetMaskOrder(page, 'mask-1');

    // result
    expect((page.nodes['mask-1'] as TMaskNode).childIds).toEqual(['a', 'b']);
  });

  it('should do nothing when the target parent is a plain group, not a mask', () => {
    // mock
    const a = buildRect({ id: 'a', parentId: 'group-1' });
    const frame = buildFrame({ id: 'frame-1', parentId: 'group-1' });
    const group: TGroupNode = {
      childIds: ['a', 'frame-1'],
      height: 10,
      id: 'group-1',
      name: 'Group',
      parentId: null,
      rotation: 0,
      type: NodeType.group,
      width: 10,
      x: 0,
      y: 0,
    };
    const page = buildPage({ nodes: { a, 'frame-1': frame, 'group-1': group } });

    // action
    resyncTargetMaskOrder(page, 'group-1');

    // result
    expect(group.childIds).toEqual(['a', 'frame-1']);
  });

  it('should do nothing when the target parent id is null (a root-level move)', () => {
    // mock
    const page = buildPage({ nodes: {}, rootOrder: ['a'] });

    // action & result — should not throw
    expect(() => resyncTargetMaskOrder(page, null)).not.toThrow();
  });

  it('should do nothing when the target parent id does not resolve to a node', () => {
    // mock
    const page = buildPage({ nodes: {} });

    // action & result — should not throw
    expect(() => resyncTargetMaskOrder(page, 'missing')).not.toThrow();
  });
});
