// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getFreeformFrameChildResizeOrigins } from '../getFreeformFrameChildResizeOrigins';

const frame = (overrides: Partial<TSceneNode>): TSceneNode =>
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

const rect = (overrides: Partial<TSceneNode>): TSceneNode =>
  ({
    fill: '#ff0000',
    height: 20,
    id: 'r',
    name: 'Rect',
    parentId: 'frame',
    rotation: 0,
    type: NodeType.rectangle,
    width: 20,
    x: 10,
    y: 10,
    ...overrides,
  }) as TSceneNode;

describe('getFreeformFrameChildResizeOrigins', () => {
  it('should capture an origin for every descendant of a single selected freeform frame', () => {
    const inner = frame({ childIds: ['leaf'], id: 'inner', parentId: 'frame' });
    const leaf = rect({ id: 'leaf', parentId: 'inner' });
    const root = frame({ childIds: ['inner', 'r'] });
    const nodes = { frame: root, inner, leaf, r: rect({}) };

    const result = getFreeformFrameChildResizeOrigins([root], nodes);

    expect(Object.keys(result ?? {}).sort()).toEqual(['inner', 'leaf', 'r']);
    expect(result?.r).toEqual({ flip: null, height: 20, rotation: 0, width: 20, x: 10, y: 10 });
  });

  it('should return undefined for an auto-layout frame', () => {
    const root = frame({ childIds: ['r'], layoutMode: LayoutMode.horizontal });

    expect(getFreeformFrameChildResizeOrigins([root], { frame: root, r: rect({}) })).toBeUndefined();
  });

  it('should return undefined for a grid frame', () => {
    const root = frame({ childIds: ['r'], layoutMode: LayoutMode.grid });

    expect(getFreeformFrameChildResizeOrigins([root], { frame: root, r: rect({}) })).toBeUndefined();
  });

  it('should return undefined when more than one node is selected', () => {
    const root = frame({ childIds: ['r'] });

    expect(getFreeformFrameChildResizeOrigins([root, rect({})], { frame: root, r: rect({}) })).toBeUndefined();
  });

  it('should return undefined for a childless freeform frame', () => {
    const root = frame({});

    expect(getFreeformFrameChildResizeOrigins([root], { frame: root })).toBeUndefined();
  });

  it('should return undefined when the only selected node is not a frame', () => {
    expect(getFreeformFrameChildResizeOrigins([rect({ parentId: null })], {})).toBeUndefined();
  });
});
