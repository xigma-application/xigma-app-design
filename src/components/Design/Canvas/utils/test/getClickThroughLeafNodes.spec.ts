// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getClickThroughLeafNodes } from '../getClickThroughLeafNodes';

const buildFrame = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ffffff',
    height: 100,
    id: 'frame',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const buildRect = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 10,
    id: 'rect',
    name: 'Rectangle',
    parentId: null,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const buildSection = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    childIds: [],
    fill: '#444444',
    height: 100,
    id: 'section',
    name: 'Section',
    parentId: null,
    rotation: 0,
    type: NodeType.section,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

const buildGroup = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    childIds: [],
    height: 100,
    id: 'group',
    name: 'Group',
    parentId: null,
    rotation: 0,
    type: NodeType.group,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('getClickThroughLeafNodes', () => {
  it('should keep a plain node with no container ancestor', () => {
    const rect = buildRect();

    expect(getClickThroughLeafNodes([rect], { [rect.id]: rect })).toEqual([rect]);
  });

  it('should recurse through a click-through (top-level) frame and keep its direct child', () => {
    const frame = buildFrame({ childIds: ['rect'] });
    const rect = buildRect({ parentId: 'frame' });
    const nodesById = { [frame.id]: frame, [rect.id]: rect };

    expect(getClickThroughLeafNodes([frame, rect], nodesById)).toEqual([rect]);
  });

  it('should treat a frame nested directly inside another frame as an atomic leaf', () => {
    const outer = buildFrame({ childIds: ['nested'], id: 'outer' });
    const nested = buildFrame({ childIds: ['rect'], id: 'nested', parentId: 'outer' });
    const rect = buildRect({ parentId: 'nested' });
    const nodesById = { [nested.id]: nested, [outer.id]: outer, [rect.id]: rect };

    expect(getClickThroughLeafNodes([outer, nested, rect], nodesById)).toEqual([nested]);
  });

  it('should keep every frame in a three-levels-deep nesting chain individually reachable, but never its non-frame content', () => {
    // frame1(click-through) > frame2 > frame3 > rect — each frame is its own atomic unit at any depth,
    // only the deepest actual content (the rect) is excluded, since it sits inside an opaque frame
    const frame1 = buildFrame({ childIds: ['frame2'], id: 'frame1' });
    const frame2 = buildFrame({ childIds: ['frame3'], id: 'frame2', parentId: 'frame1' });
    const frame3 = buildFrame({ childIds: ['rect'], id: 'frame3', parentId: 'frame2' });
    const rect = buildRect({ parentId: 'frame3' });
    const nodesById = { [frame1.id]: frame1, [frame2.id]: frame2, [frame3.id]: frame3, [rect.id]: rect };

    expect(getClickThroughLeafNodes([frame1, frame2, frame3, rect], nodesById)).toEqual([frame2, frame3]);
  });

  it('should keep an empty frame nested two levels deep reachable, regardless of it having no children of its own', () => {
    const frame1 = buildFrame({ childIds: ['frame2'], id: 'frame1' });
    const frame2 = buildFrame({ childIds: ['frame3'], id: 'frame2', parentId: 'frame1' });
    const frame3 = buildFrame({ childIds: [], id: 'frame3', parentId: 'frame2' });
    const nodesById = { [frame1.id]: frame1, [frame2.id]: frame2, [frame3.id]: frame3 };

    expect(getClickThroughLeafNodes([frame1, frame2, frame3], nodesById)).toEqual([frame2, frame3]);
  });

  it('should exclude a plain node sitting directly inside a section — a section is never click-through', () => {
    const section = buildSection({ childIds: ['rect'] });
    const rect = buildRect({ parentId: 'section' });
    const nodesById = { [rect.id]: rect, [section.id]: section };

    expect(getClickThroughLeafNodes([section, rect], nodesById)).toEqual([section]);
  });

  it('should keep a plain node reachable when it sits inside a click-through frame that is itself inside a section', () => {
    const section = buildSection({ childIds: ['frame'] });
    const frame = buildFrame({ childIds: ['rect'], parentId: 'section' });
    const rect = buildRect({ parentId: 'frame' });
    const nodesById = { [frame.id]: frame, [rect.id]: rect, [section.id]: section };

    expect(getClickThroughLeafNodes([section, frame, rect], nodesById)).toEqual([section, rect]);
  });

  it('should walk past a group ancestor up to the enclosing click-through frame and keep the leaf', () => {
    const frame = buildFrame({ childIds: ['group'] });
    const group = buildGroup({ childIds: ['rect'], parentId: 'frame' });
    const rect = buildRect({ parentId: 'group' });
    const nodesById = { [frame.id]: frame, [group.id]: group, [rect.id]: rect };

    expect(getClickThroughLeafNodes([frame, group, rect], nodesById)).toEqual([rect]);
  });

  it('should keep a leaf whose only ancestor is a top-level group with no container above it', () => {
    const group = buildGroup({ childIds: ['rect'] });
    const rect = buildRect({ parentId: 'group' });
    const nodesById = { [group.id]: group, [rect.id]: rect };

    expect(getClickThroughLeafNodes([group, rect], nodesById)).toEqual([rect]);
  });

  it('should keep an empty top-level group as a reachable leaf', () => {
    const group = buildGroup({ childIds: [] });

    expect(getClickThroughLeafNodes([group], { [group.id]: group })).toEqual([group]);
  });

  it('should exclude a non-empty group — its children are the real leaves', () => {
    const group = buildGroup({ childIds: ['rect'] });
    const rect = buildRect({ parentId: 'group' });
    const nodesById = { [group.id]: group, [rect.id]: rect };

    expect(getClickThroughLeafNodes([group], nodesById)).toEqual([]);
  });

  it('should still exclude a plain node behind an opaque (nested-in-frame) frame even inside a section', () => {
    const section = buildSection({ childIds: ['outer'] });
    const outer = buildFrame({ childIds: ['inner'], id: 'outer', parentId: 'section' });
    const inner = buildFrame({ childIds: ['rect'], id: 'inner', parentId: 'outer' });
    const rect = buildRect({ parentId: 'inner' });
    const nodesById = { [inner.id]: inner, [outer.id]: outer, [rect.id]: rect, [section.id]: section };

    expect(getClickThroughLeafNodes([section, outer, inner, rect], nodesById)).toEqual([section, inner]);
  });
});
