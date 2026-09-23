// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getFlowReorderFrame } from '../getFlowReorderFrame';

const flowFrame = (id: string, extra: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    height: 100,
    id,
    layoutMode: LayoutMode.horizontal,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
    ...extra,
  }) as unknown as TSceneNode;

const rect = (id: string, parentId: string | null, extra: Partial<TSceneNode> = {}): TSceneNode =>
  ({
    height: 10,
    id,
    name: 'Rectangle',
    parentId,
    rotation: 0,
    type: NodeType.rectangle,
    width: 10,
    x: 0,
    y: 0,
    ...extra,
  }) as unknown as TSceneNode;

describe('getFlowReorderFrame', () => {
  it('should return null for an empty selection', () => {
    expect(getFlowReorderFrame([], {})).toBeNull();
  });

  it('should return the shared frame for a single horizontal-flow child', () => {
    const frame = flowFrame('f1');
    const child = rect('r1', 'f1');

    expect(getFlowReorderFrame([child], { f1: frame, r1: child })).toBe(frame);
  });

  it('should return the shared frame for a single vertical-flow child', () => {
    const frame = flowFrame('f1', { layoutMode: LayoutMode.vertical });
    const child = rect('r1', 'f1');

    expect(getFlowReorderFrame([child], { f1: frame, r1: child })).toBe(frame);
  });

  it('should return the shared frame for multiple children of the same flow frame', () => {
    const frame = flowFrame('f1');
    const childA = rect('r1', 'f1');
    const childB = rect('r2', 'f1');

    expect(getFlowReorderFrame([childA, childB], { f1: frame, r1: childA, r2: childB })).toBe(frame);
  });

  it('should return null when selected nodes have different parents', () => {
    const frameA = flowFrame('f1');
    const frameB = flowFrame('f2');
    const childA = rect('r1', 'f1');
    const childB = rect('r2', 'f2');

    expect(getFlowReorderFrame([childA, childB], { f1: frameA, f2: frameB, r1: childA, r2: childB })).toBeNull();
  });

  it('should return null when the parent is not a frame', () => {
    const parent = rect('p1', null);
    const child = rect('r1', 'p1');

    expect(getFlowReorderFrame([child], { p1: parent, r1: child })).toBeNull();
  });

  it('should return null when the parent frame is freeForm', () => {
    const frame = flowFrame('f1', { layoutMode: LayoutMode.freeForm });
    const child = rect('r1', 'f1');

    expect(getFlowReorderFrame([child], { f1: frame, r1: child })).toBeNull();
  });

  it('should return null when the parent frame is a grid frame', () => {
    const frame = flowFrame('f1', { layoutMode: LayoutMode.grid });
    const child = rect('r1', 'f1');

    expect(getFlowReorderFrame([child], { f1: frame, r1: child })).toBeNull();
  });

  it('should return null when any selected node has ignoreAutoLayout set', () => {
    const frame = flowFrame('f1');
    const childA = rect('r1', 'f1');
    const childB = rect('r2', 'f1', { ignoreAutoLayout: true });

    expect(getFlowReorderFrame([childA, childB], { f1: frame, r1: childA, r2: childB })).toBeNull();
  });

  it('should return null when the first selected node has no parent', () => {
    const child = rect('r1', null);

    expect(getFlowReorderFrame([child], { r1: child })).toBeNull();
  });
});
