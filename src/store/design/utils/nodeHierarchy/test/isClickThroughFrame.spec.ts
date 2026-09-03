// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isClickThroughFrame } from '../isClickThroughFrame';

const buildFrame = (overrides: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    fill: '#ffffff',
    height: 100,
    id: 'frame-1',
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
    ...overrides,
  }) as TSceneNode;

describe('isClickThroughFrame', () => {
  it('should return false for a node that is not a frame', () => {
    const node = { ...buildFrame(), type: NodeType.rectangle } as TSceneNode;

    expect(isClickThroughFrame(node, { [node.id]: node })).toBe(false);
  });

  it('should return false for an empty frame', () => {
    const frame = buildFrame({ childIds: [] });

    expect(isClickThroughFrame(frame, { [frame.id]: frame })).toBe(false);
  });

  it('should return true for a top-level frame with children', () => {
    const frame = buildFrame({ childIds: ['child-1'] });

    expect(isClickThroughFrame(frame, { [frame.id]: frame })).toBe(true);
  });

  it('should return true for a frame with children whose parent is a section', () => {
    const section = { childIds: [], id: 'section-1', name: 'Section', parentId: null, type: NodeType.section } as unknown as TSceneNode;
    const frame = buildFrame({ childIds: ['child-1'], parentId: section.id });

    expect(isClickThroughFrame(frame, { [frame.id]: frame, [section.id]: section })).toBe(true);
  });

  it('should return false for a frame with children whose direct parent is another frame', () => {
    const outer = buildFrame({ childIds: ['nested'], id: 'outer' });
    const nested = buildFrame({ childIds: ['child-1'], id: 'nested', parentId: 'outer' });

    expect(isClickThroughFrame(nested, { [nested.id]: nested, [outer.id]: outer })).toBe(false);
  });
});
