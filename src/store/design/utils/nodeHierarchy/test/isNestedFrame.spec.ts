// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isNestedFrame } from '../isNestedFrame';

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

describe('isNestedFrame', () => {
  it('should return false for a node that is not a frame', () => {
    const node = { ...buildFrame(), type: NodeType.rectangle } as TSceneNode;

    expect(isNestedFrame(node, { [node.id]: node })).toBe(false);
  });

  it('should return false for a top-level frame', () => {
    const frame = buildFrame();

    expect(isNestedFrame(frame, { [frame.id]: frame })).toBe(false);
  });

  it('should return true for an empty frame nested directly inside a frame — nesting alone is enough, children are not required', () => {
    const outer = buildFrame({ childIds: ['nested'], id: 'outer' });
    const nested = buildFrame({ childIds: [], id: 'nested', parentId: 'outer' });

    expect(isNestedFrame(nested, { [nested.id]: nested, [outer.id]: outer })).toBe(true);
  });

  it('should return true for a frame with children nested directly inside another frame', () => {
    const outer = buildFrame({ childIds: ['nested'], id: 'outer' });
    const nested = buildFrame({ childIds: ['child-1'], id: 'nested', parentId: 'outer' });

    expect(isNestedFrame(nested, { [nested.id]: nested, [outer.id]: outer })).toBe(true);
  });

  it('should return false for a frame whose direct parent is a section', () => {
    const section = {
      childIds: ['frame-1'],
      id: 'section-1',
      name: 'Section',
      parentId: null,
      type: NodeType.section,
    } as unknown as TSceneNode;
    const frame = buildFrame({ parentId: 'section-1' });

    expect(isNestedFrame(frame, { [frame.id]: frame, [section.id]: section })).toBe(false);
  });
});
