// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isNudgeableNode } from '../isNudgeableNode';

const frame = (id: string, layoutMode?: LayoutMode): TSceneNode =>
  ({
    childIds: [],
    clipContent: true,
    height: 100,
    id,
    layoutMode,
    name: 'Frame',
    parentId: null,
    rotation: 0,
    type: NodeType.frame,
    width: 100,
    x: 0,
    y: 0,
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

describe('isNudgeableNode', () => {
  it('should allow a top-level node', () => {
    const node = rect('r1', null);

    expect(isNudgeableNode(node, { r1: node })).toBe(true);
  });

  it('should allow a freeform-frame child', () => {
    const nodes = { f1: frame('f1'), r1: rect('r1', 'f1') };

    expect(isNudgeableNode(nodes.r1, nodes)).toBe(true);
  });

  it('should block a plain flow child of an auto-layout frame', () => {
    const nodes = { f1: frame('f1', LayoutMode.horizontal), r1: rect('r1', 'f1') };

    expect(isNudgeableNode(nodes.r1, nodes)).toBe(false);
  });

  it('should allow an absolute (ignoreAutoLayout) child of an auto-layout frame', () => {
    const nodes = { f1: frame('f1', LayoutMode.vertical), r1: rect('r1', 'f1', { ignoreAutoLayout: true }) };

    expect(isNudgeableNode(nodes.r1, nodes)).toBe(true);
  });

  it('should block a plain child of a grid frame', () => {
    const nodes = { f1: frame('f1', LayoutMode.grid), r1: rect('r1', 'f1') };

    expect(isNudgeableNode(nodes.r1, nodes)).toBe(false);
  });
});
